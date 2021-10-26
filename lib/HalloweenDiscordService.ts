import { Construct, Duration } from "@aws-cdk/core";
import {
  LambdaIntegration,
  MethodLoggingLevel,
  RestApi,
} from "@aws-cdk/aws-apigateway";
import { Runtime, Tracing } from "@aws-cdk/aws-lambda";
import { Queue } from "@aws-cdk/aws-sqs";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  SubnetType,
  Vpc,
} from "@aws-cdk/aws-ec2";
import {
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
} from "@aws-cdk/aws-rds";

export class HalloweenDiscordService extends Construct {
  /**
   * Public API gateway for use by discord
   */
  apiGateway: RestApi;
  /**
   * Lambda that handles all discord interactions. This MUST respond within 3 seconds or
   * else the discord interaction will be marked as errored. This should remain very
   * lightweight and only do the bare minimum to respond to PING messages and deferred
   * responses to application commands.
   *
   * Triggered by the discord webhook endpoint.
   */
  interactionLambda: NodejsFunction;
  /**
   * FIFO SQS queue for fulfilling wining knock events.
   */
  fulfillmentQueue: Queue;
  /**
   * Deadletter queue for the fulfillment queue
   */
  fulfillmentDeadLetterQueue: Queue;
  /**
   * Lambda that handles fulfillment queue messages and issues prizes. Invoked via
   * a trigger on the fulfillment SQS queue
   */
  fulfillmentLambda: NodejsFunction;
  /**
   * Lambda that handles slash commands from discord. Invoked by the interaction lambda.
   */
  commandLambda: NodejsFunction;
  /**
   * Manually-invoked lambda for running migrations against the PG rds db.
   */
  migrationLambda: NodejsFunction;

  /**
   * Necessary VPC to house Postgres RDS. One internet-facing subnet.
   */
  vpc: Vpc;

  /**
   * Postgres RDS instance that houses app data.
   */
  databaseInstance: DatabaseInstance;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    /**
     * Resources
     */
    this.createVpc();
    this.createRdsPostgres();
    this.createApiGateway();
    this.createFulfillmentQueues();
    this.createLambdas();

    /**
     * Grants
     */
    // SQS access
    this.fulfillmentQueue.grantSendMessages(this.interactionLambda);
    // Lambda access
    this.commandLambda.grantInvoke(this.interactionLambda);

    // DB access
    this.databaseInstance.grantConnect(this.fulfillmentLambda);
    this.databaseInstance.grantConnect(this.commandLambda);
    this.databaseInstance.grantConnect(this.migrationLambda);

    // This needs to go away.
    this.databaseInstance.connections.allowDefaultPortFromAnyIpv4();

    /**
     * Lambda Triggers
     */
    this.fulfillmentLambda.addEventSource(
      new SqsEventSource(this.fulfillmentQueue, {
        enabled: true,
        batchSize: 1,
      }),
    );
    this.apiGateway.root.addMethod(
      "POST",
      new LambdaIntegration(this.interactionLambda, {
        allowTestInvoke: false,
        timeout: Duration.seconds(3),
      }),
    );
  }

  /**
   * Create all lambdas for the construct.
   */
  private createLambdas() {
    this.commandLambda = new NodejsFunction(this, "command-lambda", {
      description: "Command parser lambda",
      runtime: Runtime.NODEJS_14_X,
      entry: "resources/command-lambda/command-lambda.ts",
      handler: "handler",
      bundling: {
        minify: true,
        sourceMap: true,
      },
      environment: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        DB_SECRET_JSON: this.databaseInstance.secret!.secretValue.toString(),
        DISCORD_APPLICATION_ID:
          process.env.cchdiscord_discord_application_id || "",
        DISCORD_CLIENT_SECRET:
          process.env.cchdiscord_discord_client_secret || "",
        DISCORD_PUBLIC_KEY: process.env.cchdiscord_discord_public_key || "",
        FULFILLMENT_QUEUE_URL: this.fulfillmentQueue.queueUrl,
        NODE_OPTIONS: "--enable-source-maps",
      },
      tracing: Tracing.ACTIVE,
    });

    this.interactionLambda = new NodejsFunction(
      this,
      "discord-interaction-lambda",
      {
        runtime: Runtime.NODEJS_14_X,
        entry: "resources/interaction-lambda/interaction-lambda.ts",
        handler: "handler",
        bundling: {
          minify: true,
          sourceMap: false,
        },
        environment: {
          DISCORD_PUBLIC_KEY: process.env.cchdiscord_discord_public_key || "",
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          DB_SECRET_JSON: this.databaseInstance.secret!.secretValue.toString(),
          COMMAND_LAMBDA_ARN: this.commandLambda.functionArn,
        },
        description: "Interaction lambda",
        timeout: Duration.seconds(3),
        tracing: Tracing.ACTIVE,
      },
    );

    this.fulfillmentLambda = new NodejsFunction(
      this,
      "discord-fulfillment-lambda",
      {
        description: "Fulfillment lambda",
        runtime: Runtime.NODEJS_14_X,
        entry: "resources/fulfillment-lambda/fulfillment-lambda.ts",
        handler: "handler",
        bundling: {
          minify: true,
          sourceMap: true,
        },
        environment: {
          DISCORD_APPLICATION_ID:
            process.env.cchdiscord_discord_application_id || "",
          DISCORD_CLIENT_SECRET:
            process.env.cchdiscord_discord_client_secret || "",
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          DB_SECRET_JSON: this.databaseInstance.secret!.secretValue.toString(),
        },
        tracing: Tracing.ACTIVE,
      },
    );

    this.migrationLambda = new NodejsFunction(this, "migration-lambda", {
      runtime: Runtime.NODEJS_14_X,
      entry: "resources/migration-lambda/migration-lambda.ts",
      handler: "handler",
      bundling: {
        externalModules: ["aws-sdk"],
      },
      environment: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        DB_SECRET_JSON: this.databaseInstance.secret!.secretValue.toString(),
      },
      description: "Migration lambda",
    });
  }

  private createFulfillmentQueues() {
    this.fulfillmentDeadLetterQueue = new Queue(
      this,
      "fullfillment-dead-letter-queue.fifo",
      {
        fifo: true,
        // https://github.com/aws/aws-cdk/issues/5860
        queueName: "cchdiscord-prod-fulfillment-dlq.fifo",
      },
    );

    this.fulfillmentQueue = new Queue(this, "fulfillment-queue.fifo", {
      fifo: true,
      // https://github.com/aws/aws-cdk/issues/5860
      queueName: "cchdiscord-prod-fulfillment.fifo",
      deadLetterQueue: {
        queue: this.fulfillmentDeadLetterQueue,
        maxReceiveCount: 1,
      },
      receiveMessageWaitTime: Duration.seconds(20),
    });
  }

  /**
   * Create the API gateway
   */
  private createApiGateway() {
    this.apiGateway = new RestApi(this, "discord-api", {
      deployOptions: {
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        tracingEnabled: true,
      },
    });
  }

  /**
   * Create the RDS instance
   */
  private createRdsPostgres() {
    this.databaseInstance = new DatabaseInstance(this, "halloween-discord-db", {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_13,
      }),
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
      credentials: Credentials.fromGeneratedSecret("halloween_discord"),
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      publiclyAccessible: true,
    });
  }

  /**
   * Create the VPC
   */
  private createVpc() {
    this.vpc = new Vpc(this, "halloween-discord-vpc", {
      cidr: "10.0.0.0/16",
      maxAzs: 2,
      subnetConfiguration: [
        {
          name: "publicSubnet",
          subnetType: SubnetType.PUBLIC,
        },
      ],
      natGateways: 0,
    });
  }
}

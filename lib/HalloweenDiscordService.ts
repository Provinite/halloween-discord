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
   * Lambda that handles all discord interactions
   */
  interactionLambda: NodejsFunction;
  /**
   * FIFO SQS queue for fulfilling knocks
   */
  fulfillmentQueue: Queue;
  /**
   * Deadletter quee for the fulfillment queue
   */
  fulfillmentDeadLetterQueue: Queue;

  /**
   * Lambda that handles fulfillment queue messages and issues prizes
   */
  fulfillmentLambda: NodejsFunction;

  migrationLambda: NodejsFunction;

  vpc: Vpc;

  databaseInstance: DatabaseInstance;

  constructor(scope: Construct, id: string) {
    super(scope, id);

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

    this.databaseInstance.grantConnect(this.migrationLambda);

    this.apiGateway = new RestApi(this, "discord-api", {
      deployOptions: {
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        tracingEnabled: true,
      },
    });

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
          FULFILLMENT_QUEUE_URL: this.fulfillmentQueue.queueUrl,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          DB_SECRET_JSON: this.databaseInstance.secret!.secretValue.toString(),
        },
        description: "Interaction lambda",
        timeout: Duration.seconds(3),
        tracing: Tracing.ACTIVE,
      },
    );

    this.fulfillmentQueue.grantSendMessages(this.interactionLambda);

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
          sourceMap: false,
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

    this.fulfillmentLambda.addEventSource(
      new SqsEventSource(this.fulfillmentQueue, {
        enabled: true,
        batchSize: 1,
      }),
    );

    this.databaseInstance.grantConnect(this.fulfillmentLambda);
    this.databaseInstance.grantConnect(this.interactionLambda);

    this.databaseInstance.connections.allowDefaultPortFromAnyIpv4();

    this.apiGateway.root.addMethod(
      "POST",
      new LambdaIntegration(this.interactionLambda, {
        allowTestInvoke: false,
        timeout: Duration.seconds(3),
      }),
    );
  }
}

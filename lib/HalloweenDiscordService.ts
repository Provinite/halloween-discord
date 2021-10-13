import { Construct, Duration } from "@aws-cdk/core";
import {
  LambdaIntegration,
  MethodLoggingLevel,
  RestApi,
} from "@aws-cdk/aws-apigateway";
import { Runtime } from "@aws-cdk/aws-lambda";
import { Queue } from "@aws-cdk/aws-sqs";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";

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

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.apiGateway = new RestApi(this, "discord-api", {
      deployOptions: {
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
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
    });

    this.interactionLambda = new NodejsFunction(
      this,
      "discord-interaction-lambda",
      {
        runtime: Runtime.NODEJS_14_X,
        entry: "resources/interaction-lambda/interaction-lambda.ts",
        handler: "handler",
        environment: {
          DISCORD_PUBLIC_KEY: process.env.cchdiscord_discord_public_key || "",
          FULFILLMENT_QUEUE_URL: this.fulfillmentQueue.queueUrl,
        },
      },
    );
    this.fulfillmentQueue.grantSendMessages(this.interactionLambda);

    this.fulfillmentLambda = new NodejsFunction(
      this,
      "discord-fulfillment-lambda",
      {
        runtime: Runtime.NODEJS_14_X,
        entry: "resources/fulfillment-lambda/fulfillment-lambda.ts",
        handler: "handler",
        environment: {
          DISCORD_APPLICATION_ID:
            process.env.cchdiscord_discord_application_id || "",
          DISCORD_CLIENT_SECRET:
            process.env.cchdiscord_discord_client_secret || "",
        },
      },
    );
    this.fulfillmentLambda.addEventSource(
      new SqsEventSource(this.fulfillmentQueue),
    );

    this.apiGateway.root.addMethod(
      "POST",
      new LambdaIntegration(this.interactionLambda, {
        allowTestInvoke: false,
        timeout: Duration.millis(2500),
      }),
    );
  }
}

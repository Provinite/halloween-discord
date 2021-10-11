import { Construct, Duration } from "@aws-cdk/core";
import {
  LambdaIntegration,
  MethodLoggingLevel,
  RestApi,
} from "@aws-cdk/aws-apigateway";
import { Runtime } from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";

export class HalloweenDiscordService extends Construct {
  apiGateway: RestApi;
  interactionLambda: NodejsFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.apiGateway = new RestApi(this, "discord-api", {
      deployOptions: {
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
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
        },
      },
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

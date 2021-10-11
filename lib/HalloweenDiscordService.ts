import { Construct, Duration } from "@aws-cdk/core";
import { LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { Runtime } from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";

export class HalloweenDiscordService extends Construct {
  apiGateway: RestApi;
  interactionLambda: NodejsFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.apiGateway = new RestApi(this, "discord-api");

    this.interactionLambda = new NodejsFunction(
      this,
      "discord-interaction-lambda",
      {
        runtime: Runtime.NODEJS_14_X,
        entry: "resources/interaction-lambda.ts",
        handler: "handler",
        environment: {},
      },
    );
  }

  hookupLambdas(): void {
    this.apiGateway.root.addMethod(
      "POST",
      new LambdaIntegration(this.interactionLambda, {
        allowTestInvoke: false,
        timeout: Duration.millis(2500),
      }),
    );
  }
}

import { Construct } from "@aws-cdk/core";
import { RestApi } from "@aws-cdk/aws-apigateway";

export class HalloweenDiscordService extends Construct {
  apiGateway: RestApi;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.apiGateway = new RestApi(this, "discord-api");
  }
}

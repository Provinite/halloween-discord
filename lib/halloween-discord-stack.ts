import * as cdk from "@aws-cdk/core";
import { HalloweenDiscordService } from "./HalloweenDiscordService";

export class HalloweenDiscordStack extends cdk.Stack {
  halloweenDiscordService: HalloweenDiscordService;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.halloweenDiscordService = new HalloweenDiscordService(
      this,
      "halloween-discord-service",
    );
  }
}

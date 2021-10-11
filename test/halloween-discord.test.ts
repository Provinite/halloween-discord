import { expect as expectCDK, haveResource } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as HalloweenDiscord from "../lib/halloween-discord-stack";

// this seems really cool and useful. need to learn more about aws-cdk/assert
// and cloudformation
test.skip("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new HalloweenDiscord.HalloweenDiscordStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(
    haveResource("AWS::ApiGateway::RestApi", {
      Name: "discord-api",
    }),
  );
});

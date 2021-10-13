# CDK Construct for Cloverse Halloween Discord Event

Typescript serverless CDK construct for hosting the cloverse halloween discord event.

## Construct

![AWS Infrastructure Diagram indicating communication with Discord via an API Gateway using Lambda proxies, DynamoDB, and an SQS queue for fulfillment](/docs/infrastructure.drawio.png)

## Slash Commands

The app uses slash commands for user interaction. Everything is managed this way. The commands available are detailed in the following diagram.

![A gigantic unreadable flow chart detailing the discord slash commands for the application](/docs/command-workflows.drawio.png)

## Useful commands

- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

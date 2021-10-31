import {
  RESTPostAPIApplicationGuildCommandsJSONBody,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord-api-types/v9";
import { HalloweenCommand } from "./HalloweenCommand";

type MaybeArray<T> = T | T[];

export const commandDefinitions: Record<
  HalloweenCommand,
  MaybeArray<RESTPostAPIApplicationGuildCommandsJSONBody>
> = {
  /**
   * /knock
   */
  [HalloweenCommand.Knock]: {
    name: "knock",
    description: "Trick or Treat!",
    type: ApplicationCommandType.ChatInput,
  },
  /**
   * /help
   */
  [HalloweenCommand.Help]: {
    name: "help",
    description: "Learn how to participate in Trick or Treat!",
    type: ApplicationCommandType.ChatInput,
  },
  /**
   * /info
   */
  [HalloweenCommand.Info]: {
    name: "info",
    description: "Get event information, like reset time",
    type: ApplicationCommandType.ChatInput,
  },
  /**
   * /credits
   */
  [HalloweenCommand.Credits]: {
    name: "credits",
    description: "Get event credits",
    type: ApplicationCommandType.ChatInput,
  },
  /**
   * /settings list
   * /settings set $setting $value
   */
  [HalloweenCommand.Settings]: {
    name: "settings",
    description: "Set up the ToT event [Admin Only]",
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: "list",
        description: "List all settings for the event",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "set",
        description: "Change a setting for the event",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "setting",
            type: ApplicationCommandOptionType.String,
            description: "Which setting to edit",
            choices: [
              { name: "Reset Time", value: "reset_time" },
              {
                name: "Knocks Per Day",
                value: "knocks_per_day",
              },
              {
                name: "Start Date",
                value: "start_date",
              },
              {
                name: "End Date",
                value: "end_date",
              },
              {
                name: "Win Rate",
                value: "win_rate",
              },
            ],
            required: true,
          },
          {
            name: "value",
            type: ApplicationCommandOptionType.String,
            description: "The new setting value",
            required: true,
          },
        ],
      },
    ],
  },
  /**
   * /prize list
   * /prize admin add $id $name $stock $image $weight
   * /prize admin set $field $value
   */
  [HalloweenCommand.Prize]: {
    name: "prize",
    description: "Prize commands",
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "list",
        description: "List prizes",
      },
      {
        type: ApplicationCommandOptionType.SubcommandGroup,
        name: "admin",
        description: "Manage prizes [Admin only]",
        options: [
          {
            name: "add",
            description: "Add a prize",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "id",
                type: ApplicationCommandOptionType.String,
                description: 'The id of the prize (eg: "myo-common")',
                required: true,
              },
              {
                name: "name",
                type: ApplicationCommandOptionType.String,
                description:
                  'The name of the prize (eg: "Common MYO Pillowing")',
                required: true,
              },
              {
                name: "stock",
                type: ApplicationCommandOptionType.Integer,
                description: "The number of this prize in the pool",
                required: true,
              },
              {
                name: "image",
                type: ApplicationCommandOptionType.String,
                description: "A link to an image for this prize",
                required: true,
              },
              {
                name: "weight",
                type: ApplicationCommandOptionType.Integer,
                required: false,
                description:
                  "The weight used to assign probability to wining this prize. Defaults to 10",
              },
            ],
          },
          {
            name: "edit",
            description: "Modify a prize",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
              {
                name: "id",
                description:
                  "The ID of the prize to edit (something like myo-common)",
                type: ApplicationCommandOptionType.String,
                required: true,
              },
              {
                name: "field",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                  {
                    name: "stock",
                    value: "initialStock",
                  },
                  {
                    name: "weight",
                    value: "weight",
                  },
                  {
                    name: "image url",
                    value: "image",
                  },
                ],
                description: "The field to change",
              },
              {
                name: "value",
                description: "The new value of the field",
                required: true,
                type: ApplicationCommandOptionType.String,
              },
            ],
          },
        ],
      },
    ],
  },
  /**
   * "gifty" user command
   * /gifty @user
   */
  [HalloweenCommand.Gifty]: [
    {
      name: "gifty",
      type: ApplicationCommandType.User,
    },
    {
      name: "gifty",
      description:
        "Send someone an extra knock to use. (This does not cost you a knock)",
      type: ApplicationCommandType.ChatInput,
      options: [
        {
          type: ApplicationCommandOptionType.User,
          required: true,
          name: "user",
          description: "The user to send a gifty to",
        },
      ],
    },
  ],
};

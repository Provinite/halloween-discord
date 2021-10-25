import { PermissionFlagsBits } from "discord-api-types/v9";
import { prizeService } from "../../../common/db/prizeService";
import { Prize } from "../../../common/db/RecordType";
import { getClientCredentialsToken } from "../../../common/discord/getClientCredentialsToken";
import {
  commandStructure,
  HalloweenCommand,
} from "../../../common/discord/HalloweenCommand";
import { updateInteractionResponse } from "../../../common/discord/updateInteractionResponse";
import { isKeyOf } from "../../../common/isKeyOf";
import { DiscordReportableError } from "../../errors/DiscordReportableError";
import { HalloweenDiscordError } from "../../errors/HalloweenDiscordError";
import { chatSubcommandHandler } from "../handlers/chatSubcommandHandler";

/**
 * Interface for an option handler object. Includes
 * the field name, a validation function, and a transform
 * function for converting the incoming string value to
 * the final field value.
 */
interface OptionHandler<Field extends keyof Prize> {
  field: Field;
  transform: (s: string) => Prize[Field];
  validate: (s: string) => boolean;
}
/**
 * Type-safety for the options.
 * @param optionHandler An option handler for a prize field.
 * @returns optionHandler
 */
function optionHandler<Field extends keyof Prize>(
  optionHandler: OptionHandler<Field>,
) {
  return optionHandler;
}
/**
 * Subcommand for adding new prizes to the guild. Format:
 * add <id> <name> <initial stock> <image url> [weight]
 * @param id A human readable ID for the prize, must be unique. Something like "myo-common"
 * @param name The name of the prize. Something like "Common MYO Pillowing"
 * @param initialStock The initial stock of the prize.
 * @param image The image url of the prize.
 * @param weight The weight of the prize. Any positive number.
 * Requires admin permissions to edit the prize.
 * @example
 * add myo-common "Common MYO Pillowing" https://i.imgur.com/a/a.png 10
 */
export const addPrizeSubCommand = chatSubcommandHandler(
  {
    requiredPermissions: PermissionFlagsBits.Administrator,
    subCommandName: commandStructure[HalloweenCommand.Prize].Admin.Add,
  },
  async (subCommand, interaction) => {
    const optionFields = {
      /**
       * The id field is a lowercase no-spaces human readable id
       * for the prize.
       **/
      id: optionHandler({
        field: "id",
        transform: (s) => s,
        validate: (s) => /^[a-z][a-z-]{2,25}$/.test(s),
      }),
      /**
       * The name field is the name of the prize.
       */
      name: optionHandler({
        field: "name",
        validate: () => true,
        transform: (s) => s,
      }),
      /**
       * The initial stock field is the number of the prize to start with
       * at the beginning of the event.
       */
      stock: optionHandler({
        field: "initialStock",
        validate: (s) => /^[0-9]+$/.test(s),
        transform: (s) => Number.parseInt(s, 10),
      }),
      /**
       * The image field is the url of the prize image.
       */
      image: optionHandler({
        field: "image",
        validate: () => true,
        transform: (s) => s,
      }),
      /**
       * The weight field controls the relative chances of prizes being given out.
       */
      weight: optionHandler({
        field: "weight",
        validate: (s) => /^[0-9]+$/.test(s),
        transform: (s) => Number.parseInt(s, 10),
      }),
    } as const;

    // The prize to be added.
    let prize: Prize = {
      guildId: interaction.guild_id,
    } as Prize;

    for (const option of subCommand.options) {
      const optionName = option.name;
      if (isKeyOf(optionName, optionFields)) {
        const optionField = optionFields[optionName];
        const value = String(option.value);
        // validate the field value before transforming. This is a basic validation to prevent
        // erroring during type conversion. Full validation is handled in the prize service.
        if (optionField.validate(value)) {
          const transformedValue = optionField.transform(value);
          (prize as any)[optionField.field] = transformedValue;
        } else {
          throw new HalloweenDiscordError({
            thrownFrom: "addPrizeSubCommand",
            message: `Couldn't process value for field ${optionName}`,
            interaction,
            sourceError: new Error(
              `Typecasting safety validataion failed while adding prize. Field: ${optionName}`,
            ),
          });
        }
      } else {
        const acceptableOptions = Object.values(optionFields)
          .map((v) => v.field)
          .join(", ");
        throw new HalloweenDiscordError({
          thrownFrom: "addPrizeSubCommand",
          message: `Unexpected option, ${optionName}. Valid options are `,
          interaction,
          sourceError: new Error(
            `Unexpected option ${optionName}. Expected one of: ${acceptableOptions}`,
          ),
        });
      }
    }
    if (!prize.weight) {
      prize.weight = 10;
    }
    try {
      prize = await prizeService.savePrize(prize);
    } catch (err) {
      if (err instanceof DiscordReportableError) {
        throw err;
      } else if (err instanceof Error) {
        throw new HalloweenDiscordError({
          thrownFrom: "addPrizeSubCommand",
          message: `Couldn't save prize`,
          sourceError: err,
        });
      }
      throw new HalloweenDiscordError({
        thrownFrom: "addPrizeSubCommand",
        message: `Couldn't save prize`,
        sourceError: new Error(JSON.stringify(err)),
      });
    }
    await updateInteractionResponse(
      await getClientCredentialsToken(),
      interaction.token,
      {
        content: `Added ${prize.initialStock} units of ${prize.name} as ${prize.id} with weight ${prize.weight}`,
      },
    );
  },
);

import { Knex } from "knex";
import { ValidationError } from "../errors/ValidationError";
import { knex } from "./client";
import { Prize } from "./RecordType";
import { HalloweenTable } from "./TableName";

/**
 * Callback to modify the query. Useful for adding where clauses etc
 */
export type PrizeQueryModifier = (
  qb: Knex.QueryBuilder<Prize, Prize[]>,
) => Knex.QueryBuilder<Prize, Prize[]>;

/**
 * Service for managing prizes.
 */
export const prizeService = {
  async getPrizes(
    modifyQuery: PrizeQueryModifier = (qb) => qb,
  ): Promise<Prize[]> {
    let queryBuilder = knex()<Prize>(HalloweenTable.Prize).select("*");
    queryBuilder = modifyQuery(queryBuilder);
    return await queryBuilder;
  },
  /**
   * Save a prize to the database.
   * @param prize The prize to save.
   * @returns The prize
   */
  async savePrize(prize: Prize): Promise<Prize> {
    const validationResult = this.validatePrize(prize);
    if (validationResult === true) {
      await knex(HalloweenTable.Prize).insert(prize);
      return prize;
    } else {
      throw new ValidationError({
        message: "Prize validation failed",
        validationErrors: validationResult,
        thrownFrom: "prizeService.savePrize",
        sourceError: new Error(
          `Prize validation failed when saving a prize with id ${prize.id}`,
        ),
      });
    }
  },

  /**
   * Validate a prize.
   * @param prize The prize to validate.
   * @returns True if the prize is valid, an array of objects with field names and error messages if not.
   */
  validatePrize(
    prize: Omit<Prize, "currentStock">,
  ): true | Array<{ field: keyof Prize | "*"; error: string }> {
    const { id, guildId, name, initialStock, weight, image } = prize;
    const currentStock = initialStock;

    const rules: Array<[keyof Prize | "*", string, () => boolean]> = [
      [
        "*",
        "All prize fields are required",
        () => Boolean(id && guildId && name && initialStock && weight && image),
      ],
      [
        "id",
        "id must be 2-25 lowercase characters",
        () => typeof id === "string" && /^[a-z-]{2,25}$/.test(id),
      ],
      [
        "guildId",
        "guildId must be a non-empty string",
        () => typeof guildId === "string" && guildId.length > 0,
      ],
      ["name", "name must be a string", () => typeof name === "string"],
      [
        "initialStock",
        "initialStock must be a positive integer less than 1000",
        () =>
          typeof initialStock === "number" &&
          initialStock > 0 &&
          initialStock < 1000 &&
          Number.isInteger(initialStock),
      ],
      [
        "weight",
        "weight must be an integer between 0 and 1000",
        () =>
          typeof weight === "number" &&
          weight >= 0 &&
          weight <= 1000 &&
          Number.isInteger(weight),
      ],
      [
        "image",
        "image must be an https or http string URL to a png or jpg image",
        () =>
          typeof image === "string" && /^https?:\/\/.+\.(png|jpg)$/.test(image),
      ],
      [
        "currentStock",
        "currentStock must be initialStock",
        () => currentStock === initialStock,
      ],
    ];

    const failingRules = rules.filter(([, , rule]) => !rule());
    if (!failingRules.length) {
      return true;
    } else {
      return failingRules.map(([field, error]) => ({
        field,
        error,
      }));
    }
  },
};

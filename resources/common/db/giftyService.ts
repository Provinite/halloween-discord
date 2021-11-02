import { Knex } from "knex";
import { SetOptional } from "type-fest";
import { ValidationError } from "../errors/ValidationError";
import { knex } from "./client";
import { guildSettingsService } from "./guildSettingsService";
import { Gifty, KnockEvent } from "./RecordType";
import { HalloweenTable } from "./TableName";

export const giftyService = {
  /**
   * Marry a gifty and a knock event, consuming the gifty.
   * @param gifty
   * @param knockEvent
   */
  async fulfillGifty(
    gifty: Gifty,
    knockEvent: KnockEvent,
    tx = knex(),
  ): Promise<Gifty> {
    if (gifty.knockEventId !== null) {
      throw new ValidationError({
        message: `Attempted to use gifty with id ${gifty.id} on a knock but it was already fulfilled `,
        thrownFrom: "giftyService.fulfillGifty",
        sourceError: new Error(
          `Attempted to use gifty with id ${gifty.id} on a knock but it was already fulfilled `,
        ),
        validationErrors: [
          {
            field: "gifty",
            error:
              "Tried to redeem a gifty that was already redeemed. Something went wrong.",
          },
        ],
      });
    }
    const [result] = await tx<Gifty>(HalloweenTable.Gifty)
      .update({
        knockEventId: knockEvent.id,
      })
      .where({
        id: gifty.id,
      })
      .limit(1)
      .returning("*");
    return result;
  },

  /**
   * Save a new gifty to the database
   * @param gifty
   * @param options
   * @param options.rateLimit=true If false, don't rate limit gifty creation. Useful for testing or administrative purposes.
   * @param tx
   * @returns The newly created gifty
   */
  async saveGifty(
    gifty: Omit<Gifty, "time" | "id" | "knockEventId">,
    options = { rateLimit: true },
    tx = knex(),
  ): Promise<Gifty> {
    if (options.rateLimit === undefined) {
      options.rateLimit = true;
    }
    const validationResult = await this.validateGiftyForCreate(
      gifty,
      options,
      tx,
    );
    if (validationResult === true) {
      const [result] = await tx<Gifty, Gifty[]>(HalloweenTable.Gifty)
        .insert(gifty)
        .returning("*");
      return result;
    } else {
      throw new ValidationError({
        message: "Gifty validation failed",
        sourceError: new Error("Failed validating gifty"),
        thrownFrom: "giftyService.saveGifty",
        validationErrors: validationResult,
      });
    }
  },

  async validateGiftyForCreate(
    gifty: SetOptional<Gifty, "time" | "id" | "knockEventId">,
    options = { rateLimit: true },
    tx = knex(),
  ): Promise<true | { field: string; error: string }[]> {
    const rules: [
      keyof Gifty | "*",
      string,
      () => Promise<boolean> | boolean,
    ][] = [
      [
        "guildId",
        "Guild ID must be a numeric string",
        () => typeof gifty.guildId === "string" && /^\d+$/.test(gifty.guildId),
      ],
      [
        "fromUserId",
        "from user id must be a numeric string",
        () =>
          typeof gifty.fromUserId === "string" &&
          /^\d+$/.test(gifty.fromUserId),
      ],
      [
        "toUserId",
        "to user id must be a numeric string",
        () =>
          typeof gifty.toUserId === "string" && /^\d+$/.test(gifty.toUserId),
      ],
      [
        "knockEventId",
        "Knock Event ID must not be set at creation",
        () => !gifty.knockEventId,
      ],
      ["id", "ID Must not be set at creation", () => !gifty.id],
      ["time", "Time must not be set at creation", () => !gifty.time],
      [
        "*",
        "Each user may only send one gifty per reset",
        async () => {
          if (options.rateLimit === false) {
            return true;
          }
          const [guildSettings, lastGifty] = await Promise.all([
            guildSettingsService.getGuildSettings(gifty.guildId, tx),
            giftyService.getLastSentGifty(gifty.guildId, gifty.fromUserId, tx),
          ]);
          if (!lastGifty) {
            return true;
          }
          const lastReset = guildSettingsService.getLastReset(guildSettings);
          return lastReset.isAfter(lastGifty.time);
        },
      ],
    ];
    const failingRules: [keyof Gifty | "*", string][] = [];
    for (const rule of rules) {
      const result = await rule[2]();
      if (!result) {
        failingRules.push([rule[0], rule[1]]);
      }
    }
    if (!failingRules.length) {
      return true;
    } else {
      return failingRules.map(([field, error]) => ({
        field,
        error,
      }));
    }
  },
  /**
   * Get the last gifty a user sent (if any)
   * @param guildId
   * @param fromUserId
   * @param tx
   * @returns The most recently sent gifty from the specified user, or undefined if there is none.
   */
  async getLastSentGifty(
    guildId: string,
    fromUserId: string,
    tx = knex(),
  ): Promise<Gifty | undefined> {
    return tx<Gifty>(HalloweenTable.Gifty)
      .select("*")
      .where({
        guildId,
        fromUserId,
      })
      .orderBy("time", "desc")
      .first();
  },

  /**
   * Get the next pending gifty (if any is available) that a user is eligible to spend on knock events.
   * @param guildId
   * @param toUserId
   * @param tx
   * @returns
   */
  async getNextPendingGifty(
    guildId: string,
    toUserId: string,
    modifyQuery: (
      qb: Knex.QueryBuilder<Gifty, Gifty | undefined>,
    ) => typeof qb = (qb) => qb,
    tx = knex(),
  ): Promise<Gifty | undefined> {
    return modifyQuery(
      tx<Gifty>(HalloweenTable.Gifty)
        .select("*")
        .where({ guildId, toUserId, knockEventId: null })
        .orderBy("time", "asc")
        .first(),
    );
  },

  /**
   * Get the number of pending gifties a user has outstanding (ready to be spent on knocks).
   * @param guildId
   * @param toUserId
   * @param tx
   * @returns
   */
  async getPendingGiftyCount(
    guildId: string,
    toUserId: string,
    tx = knex(),
  ): Promise<number> {
    const [{ count }] = await tx<Gifty>(HalloweenTable.Gifty)
      .count("*", { as: "count" })
      .where({
        guildId,
        toUserId,
        knockEventId: null,
      });
    return typeof count === "string" ? parseInt(count, 10) : count;
  },

  async getGiftyForKnockEvent(
    knockEventId: number,
    tx = knex(),
  ): Promise<Gifty | undefined> {
    return tx<Gifty>(HalloweenTable.Gifty)
      .select("*")
      .where({ knockEventId })
      .first();
  },

  async disassociateGiftiesFromKnockEvent(
    knockEventId: number,
    tx = knex(),
  ): Promise<void> {
    await tx<Gifty>(HalloweenTable.Gifty)
      .update({ knockEventId: null })
      .where({ knockEventId });
  },
};

export function isGiftyRateLimitError(err: ValidationError): boolean {
  return err.config.validationErrors.some(({ field }) => field === "*");
}

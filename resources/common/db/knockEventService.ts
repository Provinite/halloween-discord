import { Knex } from "knex";
import { KnockEvent } from "./RecordType";
import { HalloweenTable } from "./TableName";
import { knex } from "./client";
import { ValidationError } from "../errors/ValidationError";
import { SetOptional } from "type-fest";

/**
 * Callback to modify the query. Useful for adding where clauses etc
 */
export type KnockEventQueryModifier = (
  qb: Knex.QueryBuilder<KnockEvent, KnockEvent[]>,
) => Knex.QueryBuilder<KnockEvent, KnockEvent[]>;

export const knockEventService = {
  async getKnockEvents(modifyQuery: KnockEventQueryModifier = (qb) => qb) {
    return modifyQuery(knex(HalloweenTable.KnockEvent).select("*"));
  },
  async saveKnockEvent(
    knockEvent: SetOptional<Omit<KnockEvent, "id" | "time">, "isPending">,
    tx = knex(),
  ) {
    const validationResult =
      knockEventService.validateKnockEventForCreate(knockEvent);
    if (validationResult === true) {
      const [result] = await tx<KnockEvent, KnockEvent[]>(
        HalloweenTable.KnockEvent,
      )
        .insert(knockEvent)
        .returning("*");
      return result;
    } else {
      throw new ValidationError({
        message: "Invalid knock event",
        sourceError: new Error("Validation failed while creating knock event"),
        thrownFrom: "knockEventService.saveKnockEvent",
        validationErrors: validationResult,
      });
    }
  },
  validateKnockEventForCreate(
    knockEvent: SetOptional<KnockEvent, "id" | "time" | "isPending">,
  ) {
    const { id, time, userId, guildId, isPending } = knockEvent;
    const rules: Array<[keyof KnockEvent | "*", string, () => boolean]> = [
      ["userId", "UserID is required", () => Boolean(userId)],
      ["guildId", "GuildID is required", () => Boolean(guildId)],
      [
        "userId",
        "UserID should be a numeric string",
        () => /^\d+$/.test(userId),
      ],
      ["id", "ID cannot be set manually", () => !id],
      ["time", "Time cannot be set mannually", () => !time],
      [
        "isPending",
        "isPending must be a boolean if set",
        () => isPending === undefined || typeof isPending === "boolean",
      ],
    ];

    const failingRules = rules.filter(([, , rule]) => !rule());
    if (!failingRules.length) {
      return true;
    } else {
      return failingRules.map(([field, error]) => ({ field, error }));
    }
  },
} as const;

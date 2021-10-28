import { Knex } from "knex";
import { KnockEvent, Prize } from "./RecordType";
import { HalloweenTable } from "./TableName";
import { knex } from "./client";
import { ValidationError } from "../errors/ValidationError";
import { SetOptional } from "type-fest";
import { DiscordReportableError } from "../../command-lambda/errors/DiscordReportableError";

/**
 * Callback to modify the query. Useful for adding where clauses etc
 */
export type KnockEventQueryModifier = (
  qb: Knex.QueryBuilder<KnockEvent, KnockEvent[]>,
) => Knex.QueryBuilder<KnockEvent, KnockEvent[]>;

export const knockEventService = {
  async getKnockEvents(
    modifyQuery: KnockEventQueryModifier = (qb) => qb,
    tx = knex(),
  ) {
    return modifyQuery(tx(HalloweenTable.KnockEvent).select("*"));
  },
  /**
   * Adds a prize to a pending knock event and marks it as no longer pending
   * @param knockEvent
   * @param prize
   */
  async fulfillPendingKnockEvent(
    knockEventId: KnockEvent["id"],
    prizeId: Prize["id"] | null,
    tx = knex(),
  ): Promise<KnockEvent> {
    const knockEvents = await knockEventService.getKnockEvents(
      (qb) =>
        qb.where({
          id: knockEventId,
          isPending: true,
        }),
      tx,
    );
    if (!knockEvents.length) {
      throw new DiscordReportableError(
        "Knock event not found during fulfillment",
        {
          errorsLambda: true,
          message:
            "Knock event not found during fulfillment. Something went wrong trying to get you a prize. Contact staff",
          name: "KnockEventNotFound",
          sourceError: new Error(
            `No knock event found with { id: ${knockEventId}, isPending: true }`,
          ),
          thrownFrom: "knockEventService",
        },
      );
    }
    const [result] = await tx<KnockEvent, KnockEvent[]>(
      HalloweenTable.KnockEvent,
    )
      .update(
        {
          isPending: false,
          prizeId: prizeId,
        },
        "*",
      )
      .where({ id: knockEventId });
    return result;
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

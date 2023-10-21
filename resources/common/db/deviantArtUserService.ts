import {
  ValidationError,
  ValidationFieldError,
} from "../errors/ValidationError";
import { knex } from "./client";
import { DeviantArtUser } from "./RecordType";
import { HalloweenTable } from "./TableName";

export const deviantArtUserService = {
  async getDeviantArtUser(
    {
      guildId,
      userId,
    }: {
      guildId: string;
      userId: string;
    },
    tx = knex(),
  ): Promise<DeviantArtUser | null> {
    const result = await tx(HalloweenTable.DeviantArtUsers)
      .select("*")
      .where({ guildId, userId })
      .first();

    return result ?? null;
  },

  async saveDeviantArtUser({
    deviantArtName,
    guildId,
    userId,
  }: Pick<
    DeviantArtUser,
    "deviantArtName" | "guildId" | "userId"
  >): Promise<void> {
    if (!guildId || !userId || !deviantArtName) {
      throw new ValidationError({
        message: "DeviantArt User validation failed",
        thrownFrom: "deviantArtUserService.saveDeviantArtUser",
        sourceError: new Error(
          `Refused to save invalid deviant art user record for guild "${guildId}" user "${userId}" and DA Name "${deviantArtName}"`,
        ),
        validationErrors: [
          !guildId && {
            error: "Missing guild id",
            field: "guildId",
          },
          !userId && {
            error: "Missing user id",
            field: "userId",
          },
          !deviantArtName && {
            error: "Missing deviantArtName",
            field: "deviantArtName",
          },
        ].filter((f): f is ValidationFieldError => Boolean(f)),
      });
    }

    if (!/^[a-zA-Z0-9-]{1,30}$/.test(deviantArtName)) {
      throw new ValidationError({
        message: "DeviantArt username validation failed",
        thrownFrom: "deviantArtUserService.saveDeviantArtUser",
        sourceError: new Error(
          `Refused to save invalid deviantArtName. Regex failed`,
        ),
        validationErrors: [
          {
            error:
              "DeviantArt username is invalid. Must contain only letters, numbers, and hyphens and be less than 30 characters",
            field: "deviantArtName",
          },
        ],
      });
    }

    await knex(HalloweenTable.DeviantArtUsers)
      .insert({
        deviantArtName,
        guildId,
        userId,
      })
      .onConflict(["guildId", "userId"])
      .merge(["deviantArtName"]);
  },
};

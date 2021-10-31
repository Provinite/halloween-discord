import { knex } from "../client";
import { HalloweenTable } from "../TableName";

export async function hasGuildSettings(
  guildId: string,
  knx = knex(),
): Promise<boolean> {
  let [{ count }] = await knx(HalloweenTable.GuildSettings)
    .count("*", { as: "count" })
    .where({ guildId });

  if (typeof count === "string") {
    count = Number.parseInt(count, 10);
  }
  return count > 0;
}

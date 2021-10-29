import moment = require("moment-timezone");
export function getDiscordEmbedTimestamp(): string {
  return moment.tz("America/Chicago").toISOString();
}

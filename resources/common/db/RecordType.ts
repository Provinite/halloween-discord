import { userIdType } from "aws-sdk/clients/sts";
import { HalloweenTable } from "./TableName";

export interface KnockEvent {
  id: number;
  guildId: string;
  userId: string;
  time: Date;
  prizeId: string | null;
  isPending: boolean;
}
export interface Prize {
  id: string;
  guildId: string;
  name: string;
  initialStock: number;
  currentStock: number;
  weight: number;
  image: string;
}
export interface GuildSettings {
  guildId: string;
  resetTime: number;
  knocksPerDay: number;
  startDate: Date | null;
  endDate: Date | null;
  winRate: number;
}

export interface Gifty {
  id: number;
  guildId: string;
  time: Date;
  fromUserId: userIdType;
  toUserId: userIdType;
  /**
   * The knock event that fulfills this gifty. Null if the gifty is pending.
   */
  knockEventId: number | null;
}

export interface Migration {
  id: string;
  ranAt: Date;
}

interface RecordKinds {
  [HalloweenTable.GuildSettings]: GuildSettings;
  [HalloweenTable.KnockEvent]: KnockEvent;
  [HalloweenTable.Prize]: Prize;
  [HalloweenTable.Migrations]: Migration;
  [HalloweenTable.Gifty]: Gifty;
}

export type RecordType<T extends HalloweenTable> = RecordKinds[T];

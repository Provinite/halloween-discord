import { HalloweenTable } from "./TableName";

export interface KnockEvent {
  id: number;
  guildId: string;
  userId: string;
  time: Date;
  prizeId: string;
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
}

export type RecordType<T extends HalloweenTable> = RecordKinds[T];

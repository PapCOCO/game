import type { ID, TimestampMs } from "./common";

export type GameLogType =
  | "system"
  | "cultivation"
  | "breakthrough"
  | "battle"
  | "drop"
  | "equipment"
  | "inventory"
  | "offline"
  | "alchemy"
  | "market";

export interface GameLogEntry {
  id: ID;
  type: GameLogType;
  message: string;
  createdAt: TimestampMs;
  payload?: Record<string, unknown>;
}

export interface GameLogState {
  entries: GameLogEntry[];
  maxEntries: number;
}

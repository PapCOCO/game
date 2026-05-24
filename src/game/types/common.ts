export type ID = string;
export type TimestampMs = number;
export type SaveVersion = string;
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface RangeNumber {
  min: number;
  max: number;
}

export interface WeightedEntry<T> {
  value: T;
  weight: number;
}

export interface UnlockCondition {
  requiredPlayerLevel?: number;
  requiredRealmId?: ID;
  requiredMapId?: ID;
}

export interface GameTimeState {
  createdAt: TimestampMs;
  updatedAt: TimestampMs;
  lastSavedAt: TimestampMs;
  lastActiveAt: TimestampMs;
}

export interface OfflineRewardSummary {
  offlineDurationMs: number;
  cappedDurationMs: number;
  cultivationGained: number;
  spiritStonesGained: number;
  itemsGained: Array<{
    itemId: ID;
    quantity: number;
  }>;
  equipmentGained: ID[];
}

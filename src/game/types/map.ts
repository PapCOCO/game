import type { ID, UnlockCondition, WeightedEntry } from "./common";

export interface MapDefinition {
  id: ID;
  name: string;
  description: string;
  order: number;
  unlockCondition?: UnlockCondition;
  monsterPool: WeightedEntry<ID>[];
  baseCultivationPerSecond: number;
  baseSpiritStonesPerMinute: number;
}

export interface MapState {
  currentMapId: ID;
  unlockedMapIds: ID[];
  encounter: {
    lastSearchedAt: number;
    totalEncounters: number;
  };
}

import type { ID } from "./common";
import type { CoreStats, BattleStats } from "./stats";
import type { EquippedItems } from "./equipment";

export interface RealmDefinition {
  id: ID;
  name: string;
  order: number;
  cultivationRequired: number;
  breakthroughRate: number;
  baseStats: CoreStats;
}

export interface CultivationState {
  currentCultivation: number;
  totalCultivation: number;
  cultivationPerSecond: number;
  breakthroughAttempts: number;
  lastBreakthroughAt?: number;
}

export interface PlayerProgressState {
  level: number;
  realmId: ID;
  unlockedMapIds: ID[];
  currentMapId?: ID;
  defeatedMonsterIds: ID[];
}

export interface PlayerState {
  id: ID;
  name: string;
  realmId: ID;
  level: number;
  spiritStones: number;
  cultivation: CultivationState;
  baseStats: CoreStats;
  finalStats: BattleStats;
  equipped: EquippedItems;
  progress: PlayerProgressState;
}

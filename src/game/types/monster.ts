import type { ID, RangeNumber, WeightedEntry } from "./common";
import type { CoreStats } from "./stats";

export interface MonsterDropItem {
  itemId: ID;
  quantity: RangeNumber;
  dropRate: number;
}

export interface MonsterDropEquipment {
  equipmentId: ID;
  dropRate: number;
}

export interface MonsterDropTable {
  spiritStones: RangeNumber;
  cultivation: RangeNumber;
  items: MonsterDropItem[];
  equipments: MonsterDropEquipment[];
}

export interface MonsterDefinition {
  id: ID;
  name: string;
  description: string;
  level: number;
  stats: CoreStats;
  maxHp: number;
  dropTable: MonsterDropTable;
}

export interface BattleEnemyState {
  monsterId: ID;
  currentHp: number;
  maxHp: number;
}

export interface AutoBattleState {
  enabled: boolean;
  currentEnemy?: BattleEnemyState;
  battleStartedAt?: number;
  lastAttackAt?: number;
  defeatedCount: number;
  playerCurrentHp?: number;
  recoveringUntil?: number;
  playerActionProgress?: number;
  enemyActionProgress?: number;
}

export interface MonsterSpawnPool {
  mapId: ID;
  monsters: WeightedEntry<ID>[];
}

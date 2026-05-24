export interface CoreStats {
  attack: number;
  defense: number;
  maxHp: number;
  speed: number;
  cultivationSpeed: number;
  spiritStoneBonus: number;
}

export type StatKey = keyof CoreStats;
export type StatModifierType = "flat" | "percent";

export interface StatModifier {
  stat: StatKey;
  type: StatModifierType;
  value: number;
}

export interface BattleStats extends CoreStats {
  currentHp: number;
}

export const EMPTY_CORE_STATS: CoreStats = {
  attack: 0,
  defense: 0,
  maxHp: 0,
  speed: 0,
  cultivationSpeed: 0,
  spiritStoneBonus: 0
};

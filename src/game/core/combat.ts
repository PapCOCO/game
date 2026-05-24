import type { CoreStats, GameSaveData } from "../types";
import { MAPS, MONSTERS } from "../config";
import { calculateFinalStats } from "./selectors";
import { pickWeighted, randomFloat } from "./random";

export type CombatResult = {
  won: boolean;
  monsterId: string | null;
  monsterName: string | null;
  playerPower: number;
  monsterPower: number;
  message: string;
};

export function calculateCombatPower(stats: CoreStats): number {
  return stats.attack * 2 + stats.defense * 1.5 + stats.maxHp * 0.2;
}

export function resolveCombat(save: GameSaveData, _now = Date.now()): CombatResult {
  const currentMap = MAPS.find((map) => map.id === save.map.currentMapId);
  const playerPower = calculateCombatPower(calculateFinalStats(save));

  if (currentMap === undefined) {
    return {
      won: false,
      monsterId: null,
      monsterName: null,
      playerPower,
      monsterPower: 0,
      message: "当前地图配置不存在，无法历练。"
    };
  }

  const monsterId = pickWeighted(currentMap.monsterPool);
  const monster = monsterId === null ? undefined : MONSTERS.find((entry) => entry.id === monsterId);

  if (monster === undefined) {
    return {
      won: false,
      monsterId: monsterId ?? null,
      monsterName: null,
      playerPower,
      monsterPower: 0,
      message: "未能在当前地图遇到有效敌人。"
    };
  }

  const monsterPower = calculateCombatPower(monster.stats);
  const won = playerPower >= monsterPower * randomFloat(0.85, 1.15);

  return {
    won,
    monsterId: monster.id,
    monsterName: monster.name,
    playerPower,
    monsterPower,
    message: won
      ? `击败了 ${monster.name}，获得奖励。`
      : `挑战 ${monster.name} 失败，暂未获得奖励。`
  };
}

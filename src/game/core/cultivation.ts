import type { GameSaveData } from "../types";
import { calculateFinalStats, getCultivationRequired, getCurrentMap } from "./selectors";
import { getNextRealm } from "./breakthrough";

export function getCultivationGainPerSecond(save: GameSaveData): number {
  const finalStats = calculateFinalStats(save);
  const currentMap = getCurrentMap(save);
  const gain = finalStats.cultivationSpeed + (currentMap?.baseCultivationPerSecond ?? 0);

  return gain <= 0 ? 1 : gain;
}

export function applyCultivationGain(
  save: GameSaveData,
  seconds: number,
  now = Date.now()
): GameSaveData {
  const gainPerSecond = getCultivationGainPerSecond(save);
  const cultivationGained = Math.max(0, seconds) * gainPerSecond;

  return {
    ...save,
    player: {
      ...save.player,
      cultivation: {
        ...save.player.cultivation,
        currentCultivation: save.player.cultivation.currentCultivation + cultivationGained,
        totalCultivation: save.player.cultivation.totalCultivation + cultivationGained,
        cultivationPerSecond: gainPerSecond
      }
    },
    runtime: {
      ...save.runtime,
      time: {
        ...save.runtime.time,
        updatedAt: now,
        lastActiveAt: now
      }
    }
  };
}

export function canBreakthrough(save: GameSaveData): boolean {
  const nextRealm = getNextRealm(save);

  if (nextRealm === null) {
    return false;
  }

  return save.player.cultivation.currentCultivation >= getCultivationRequired(save);
}

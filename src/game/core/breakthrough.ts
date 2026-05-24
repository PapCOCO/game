import type { GameLogEntry, GameSaveData, RealmDefinition } from "../types";
import { MAPS, REALMS } from "../config";
import { createId, randomChance } from "./random";
import { getUnlockedMapIdsByRealm } from "./mapUnlock";
import { calculateFinalStats, getCultivationRequired, getCurrentRealm } from "./selectors";

function appendLog(save: GameSaveData, entry: GameLogEntry): GameLogEntry[] {
  return [entry, ...save.logs.entries].slice(0, save.logs.maxEntries);
}

function getFirstUnlockedMapId(unlockedMapIds: string[]): string {
  const unlockedSet = new Set(unlockedMapIds);

  return (
    MAPS.filter((map) => unlockedSet.has(map.id)).sort(
      (first, second) => first.order - second.order
    )[0]?.id ?? unlockedMapIds[0] ?? ""
  );
}

export function getNextRealm(save: GameSaveData): RealmDefinition | null {
  const currentRealm = getCurrentRealm(save);

  if (currentRealm === undefined) {
    return null;
  }

  return (
    REALMS.filter((realm) => realm.order > currentRealm.order).sort(
      (first, second) => first.order - second.order
    )[0] ?? null
  );
}

export function breakthrough(
  save: GameSaveData,
  now = Date.now()
): { save: GameSaveData; success: boolean; message: string } {
  const currentRealm = getCurrentRealm(save);
  const nextRealm = getNextRealm(save);
  const requiredCultivation = getCultivationRequired(save);

  if (currentRealm === undefined) {
    return {
      save,
      success: false,
      message: "当前境界配置不存在。"
    };
  }

  if (nextRealm === null) {
    return {
      save,
      success: false,
      message: "已至当前版本最高境界。"
    };
  }

  if (save.player.cultivation.currentCultivation < requiredCultivation) {
    return {
      save,
      success: false,
      message: "修为尚不足以突破。"
    };
  }

  const roll = randomChance(currentRealm.breakthroughRate);

  if (!roll) {
    const failedSave: GameSaveData = {
      ...save,
      player: {
        ...save.player,
        cultivation: {
          ...save.player.cultivation,
          currentCultivation: Math.max(0, save.player.cultivation.currentCultivation - requiredCultivation * 0.3),
          breakthroughAttempts: save.player.cultivation.breakthroughAttempts + 1,
          lastBreakthroughAt: now
        }
      },
      logs: {
        ...save.logs,
        entries: appendLog(save, {
          id: createId("log"),
          type: "breakthrough",
          message: `突破失败，修为受损。当前成功率：${(currentRealm.breakthroughRate * 100).toFixed(0)}%。`,
          createdAt: now
        })
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

    return {
      save: failedSave,
      success: false,
      message: `突破失败，修为受损。当前成功率：${(currentRealm.breakthroughRate * 100).toFixed(0)}%。`
    };
  }

  const unlockedMapIds = getUnlockedMapIdsByRealm(nextRealm.id);
  const currentMapId = unlockedMapIds.includes(save.map.currentMapId)
    ? save.map.currentMapId
    : getFirstUnlockedMapId(unlockedMapIds);
  const cultivationAfterBreakthrough =
    save.player.cultivation.currentCultivation - requiredCultivation;

  const nextLevel = save.player.level + 1;

  const nextSave: GameSaveData = {
    ...save,
    meta: {
      ...save.meta,
      updatedAt: now
    },
    player: {
      ...save.player,
      realmId: nextRealm.id,
      level: nextLevel,
      cultivation: {
        ...save.player.cultivation,
        currentCultivation: cultivationAfterBreakthrough,
        breakthroughAttempts: save.player.cultivation.breakthroughAttempts + 1,
        lastBreakthroughAt: now
      },
      progress: {
        ...save.player.progress,
        level: nextLevel,
        realmId: nextRealm.id,
        unlockedMapIds,
        currentMapId
      }
    },
    map: {
      ...save.map,
      currentMapId,
      unlockedMapIds
    },
    logs: {
      ...save.logs,
      entries: appendLog(save, {
        id: createId("log"),
        type: "breakthrough",
        message: `突破成功，晋升${nextRealm.name}。`,
        createdAt: now,
        payload: {
          fromRealmId: currentRealm.id,
          toRealmId: nextRealm.id
        }
      })
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

  const finalStats = calculateFinalStats(nextSave);

  return {
    save: {
      ...nextSave,
      player: {
        ...nextSave.player,
        finalStats,
        cultivation: {
          ...nextSave.player.cultivation,
          cultivationPerSecond: finalStats.cultivationSpeed
        }
      }
    },
    success: true,
    message: `突破成功，晋升${nextRealm.name}。`
  };
}

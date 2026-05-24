import type { GameSaveData } from "../types";
import { EMPTY_CORE_STATS } from "../types";
import { MAPS, MONSTERS } from "../config";
import { calculateFinalStats } from "../core/selectors";
import { getUnlockedMapIds } from "../core/mapUnlock";
import { CURRENT_SAVE_VERSION } from "./saveVersion";
import { validateSaveData } from "./validateSave";
import { createInitialEstateState } from "../core/estate";
import { normalizeTechniqueState } from "../core/technique";
import { createInitialObjectiveState, normalizeObjectiveState } from "../core/objectives";

function getFirstUnlockedMapId(unlockedMapIds: string[]): string {
  const unlockedSet = new Set(unlockedMapIds);

  return (
    MAPS.filter((map) => unlockedSet.has(map.id)).sort(
      (first, second) => first.order - second.order
    )[0]?.id ??
    [...MAPS].sort((first, second) => first.order - second.order)[0]?.id ??
    unlockedMapIds[0] ??
    ""
  );
}

export function migrateSaveData(input: unknown): GameSaveData | null {
  if (!validateSaveData(input)) {
    return null;
  }

  if (input.version !== CURRENT_SAVE_VERSION) {
    return null;
  }

  const now = Date.now();
  const logs = input.logs ?? {
    entries: [],
    maxEntries: 200
  };
  const inventory = input.inventory ?? {
    materials: [],
    consumables: [],
    currencies: [],
    equipments: [],
    maxEquipmentCount: 100
  };
  const progress = input.player.progress ?? {
    level: input.player.level ?? 1,
    realmId: input.player.realmId,
    unlockedMapIds: input.map.unlockedMapIds ?? [],
    currentMapId: input.map.currentMapId,
    defeatedMonsterIds: []
  };
  const cultivation = input.player.cultivation ?? {
    currentCultivation: 0,
    totalCultivation: 0,
    cultivationPerSecond: 0,
    breakthroughAttempts: 0
  };
  const settings = input.settings ?? {
    autoSaveEnabled: true,
    autoSaveIntervalMs: 10000,
    offlineRewardEnabled: true,
    offlineRewardCapMs: 8 * 60 * 60 * 1000
  };
  const runtime = input.runtime ?? {
    time: {
      createdAt: now,
      updatedAt: now,
      lastSavedAt: now,
      lastActiveAt: now
    }
  };
  const runtimeTime = runtime.time ?? {
    createdAt: now,
    updatedAt: now,
    lastSavedAt: now,
    lastActiveAt: now
  };
  const inputEnemy = input.autoBattle?.currentEnemy;
  const normalizedEnemy =
    inputEnemy !== undefined &&
    typeof inputEnemy.monsterId === "string" &&
    typeof inputEnemy.currentHp === "number" &&
    typeof inputEnemy.maxHp === "number" &&
    inputEnemy.maxHp > 0 &&
    MONSTERS.some((monster) => monster.id === inputEnemy.monsterId)
      ? {
          monsterId: inputEnemy.monsterId,
          currentHp: Math.min(Math.max(0, inputEnemy.currentHp), inputEnemy.maxHp),
          maxHp: inputEnemy.maxHp
        }
      : undefined;
  const alchemy = input.alchemy ?? {
    level: 1,
    exp: 0,
    totalAttempts: 0,
    totalSuccesses: 0
  };
  const market = input.market ?? {
    items: [],
    lastRefreshedAt: now
  };
  const initialEstate = createInitialEstateState();
  const estate = input.estate ?? initialEstate;
  const normalizedEstate = {
    ...initialEstate,
    ...estate,
    spiritFields: estate.spiritFields ?? initialEstate.spiritFields,
    spiritVein: {
      ...initialEstate.spiritVein,
      ...(estate.spiritVein ?? {})
    },
    gatheringArray: {
      ...initialEstate.gatheringArray,
      ...(estate.gatheringArray ?? {})
    },
    pillFurnace: {
      ...initialEstate.pillFurnace,
      ...(estate.pillFurnace ?? {})
    }
  };
  const normalizedSave: GameSaveData = {
    ...input,
    player: {
      ...input.player,
      cultivation: {
        ...cultivation,
        currentCultivation: cultivation.currentCultivation ?? 0,
        totalCultivation: cultivation.totalCultivation ?? 0,
        cultivationPerSecond: cultivation.cultivationPerSecond ?? 0,
        breakthroughAttempts: cultivation.breakthroughAttempts ?? 0
      },
      baseStats: input.player.baseStats ?? { ...EMPTY_CORE_STATS },
      equipped: input.player.equipped ?? {},
      progress: {
        ...progress,
        level: progress.level ?? input.player.level ?? 1,
        realmId: progress.realmId ?? input.player.realmId,
        unlockedMapIds: progress.unlockedMapIds ?? input.map.unlockedMapIds ?? [],
        currentMapId: progress.currentMapId ?? input.map.currentMapId,
        defeatedMonsterIds: progress.defeatedMonsterIds ?? []
      },
      finalStats: input.player.finalStats ?? {
        ...EMPTY_CORE_STATS,
        currentHp: 0
      }
    },
    inventory: {
      ...inventory,
      materials: inventory.materials ?? [],
      consumables: inventory.consumables ?? [],
      currencies: inventory.currencies ?? [],
      equipments: (inventory.equipments ?? []).map((eq) => ({
        ...eq,
        enhancement: eq.enhancement ?? 0
      })),
      maxEquipmentCount: inventory.maxEquipmentCount ?? 100
    },
    map: {
      ...input.map,
      currentMapId: input.map.currentMapId,
      unlockedMapIds: input.map.unlockedMapIds ?? progress.unlockedMapIds ?? [],
      encounter: {
        lastSearchedAt: input.map.encounter?.lastSearchedAt ?? now - 5 * 60 * 1000,
        totalEncounters: input.map.encounter?.totalEncounters ?? 0
      }
    },
    autoBattle: {
      ...(input.autoBattle ?? {}),
      enabled: input.autoBattle?.enabled ?? true,
      currentEnemy: normalizedEnemy,
      defeatedCount: input.autoBattle?.defeatedCount ?? 0,
      recoveringUntil: input.autoBattle?.recoveringUntil,
      playerActionProgress: Math.min(Math.max(0, input.autoBattle?.playerActionProgress ?? 0), 100),
      enemyActionProgress: Math.min(Math.max(0, input.autoBattle?.enemyActionProgress ?? 0), 100),
      recentEvents: (input.autoBattle?.recentEvents ?? []).slice(0, 8)
    },
    logs: {
      ...logs,
      entries: logs.entries ?? [],
      maxEntries: logs.maxEntries ?? 200
    },
    settings: {
      ...settings,
      autoSaveEnabled: settings.autoSaveEnabled ?? true,
      autoSaveIntervalMs: settings.autoSaveIntervalMs ?? 10000,
      offlineRewardEnabled: settings.offlineRewardEnabled ?? true,
      offlineRewardCapMs: settings.offlineRewardCapMs ?? 8 * 60 * 60 * 1000
    },
    runtime: {
      ...runtime,
      time: {
        ...runtimeTime,
        createdAt: runtimeTime.createdAt ?? now,
        updatedAt: runtimeTime.updatedAt ?? now,
        lastSavedAt: runtimeTime.lastSavedAt ?? now,
        lastActiveAt: runtimeTime.lastActiveAt ?? now
      }
    },
    alchemy: {
      level: alchemy.level ?? 1,
      exp: alchemy.exp ?? 0,
      totalAttempts: alchemy.totalAttempts ?? 0,
      totalSuccesses: alchemy.totalSuccesses ?? 0
    },
    market: {
      items: market.items ?? [],
      lastRefreshedAt: market.lastRefreshedAt ?? now
    },
    estate: normalizedEstate,
    techniques: normalizeTechniqueState(input.techniques),
    objectives: createInitialObjectiveState()
  };

  const saveWithObjectives: GameSaveData = {
    ...normalizedSave,
    objectives: normalizeObjectiveState(input.objectives, normalizedSave)
  };
  const unlockedMapIds = getUnlockedMapIds(saveWithObjectives);
  const currentMapId = unlockedMapIds.includes(saveWithObjectives.map.currentMapId)
    ? saveWithObjectives.map.currentMapId
    : getFirstUnlockedMapId(unlockedMapIds);
  const saveWithUnlockedMaps: GameSaveData = {
    ...saveWithObjectives,
    player: {
      ...saveWithObjectives.player,
      progress: {
        ...saveWithObjectives.player.progress,
        unlockedMapIds,
        currentMapId
      }
    },
    map: {
      ...saveWithObjectives.map,
      currentMapId,
      unlockedMapIds
    }
  };
  const recalculatedStats = calculateFinalStats(saveWithUnlockedMaps);
  const recoveringUntil = normalizedSave.autoBattle.recoveringUntil;
  const isRecovering = recoveringUntil !== undefined && recoveringUntil > now;
  const playerCurrentHp =
    saveWithUnlockedMaps.autoBattle.playerCurrentHp === undefined ||
    (!isRecovering && saveWithUnlockedMaps.autoBattle.playerCurrentHp <= 0)
      ? recalculatedStats.maxHp
      : Math.min(
          Math.max(0, saveWithUnlockedMaps.autoBattle.playerCurrentHp),
          Math.max(1, recalculatedStats.maxHp)
        );

  return {
    ...saveWithUnlockedMaps,
    player: {
      ...saveWithUnlockedMaps.player,
      finalStats: recalculatedStats
    },
    autoBattle: {
      ...saveWithUnlockedMaps.autoBattle,
      playerCurrentHp,
      playerActionProgress: saveWithUnlockedMaps.autoBattle.playerActionProgress ?? 0,
      enemyActionProgress: saveWithUnlockedMaps.autoBattle.enemyActionProgress ?? 0
    }
  };
}

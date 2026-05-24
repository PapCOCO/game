import type { GameSaveData } from "../types";
import { EMPTY_CORE_STATS } from "../types";
import { MONSTERS } from "../config";
import { calculateFinalStats } from "../core/selectors";
import { CURRENT_SAVE_VERSION } from "./saveVersion";
import { validateSaveData } from "./validateSave";

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
      equipments: inventory.equipments ?? [],
      maxEquipmentCount: inventory.maxEquipmentCount ?? 100
    },
    map: {
      ...input.map,
      currentMapId: input.map.currentMapId,
      unlockedMapIds: input.map.unlockedMapIds ?? progress.unlockedMapIds ?? []
    },
    autoBattle: {
      ...(input.autoBattle ?? {}),
      enabled: input.autoBattle?.enabled ?? true,
      currentEnemy: normalizedEnemy,
      defeatedCount: input.autoBattle?.defeatedCount ?? 0,
      recoveringUntil: input.autoBattle?.recoveringUntil
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
    }
  };

  const recalculatedStats = calculateFinalStats(normalizedSave);
  const recoveringUntil = normalizedSave.autoBattle.recoveringUntil;
  const isRecovering = recoveringUntil !== undefined && recoveringUntil > now;
  const playerCurrentHp =
    normalizedSave.autoBattle.playerCurrentHp === undefined ||
    (!isRecovering && normalizedSave.autoBattle.playerCurrentHp <= 0)
      ? recalculatedStats.maxHp
      : Math.min(
          Math.max(0, normalizedSave.autoBattle.playerCurrentHp),
          Math.max(1, recalculatedStats.maxHp)
        );

  return {
    ...normalizedSave,
    player: {
      ...normalizedSave.player,
      finalStats: recalculatedStats
    },
    autoBattle: {
      ...normalizedSave.autoBattle,
      playerCurrentHp
    }
  };
}

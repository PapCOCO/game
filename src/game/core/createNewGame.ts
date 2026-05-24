import type { GameSaveData, MapDefinition, RealmDefinition } from "../types";
import { EMPTY_CORE_STATS } from "../types";
import { MAPS, REALMS } from "../config";
import { CURRENT_SAVE_VERSION } from "../save/saveVersion";
import { createId } from "./random";
import { getUnlockedMapIds } from "./mapUnlock";
import { calculateFinalStats } from "./selectors";
import { createInitialEstateState } from "./estate";
import { createInitialTechniqueState } from "./technique";
import { createInitialObjectiveState } from "./objectives";

function getFirstRealm(): RealmDefinition {
  const firstRealm = [...REALMS].sort((first, second) => first.order - second.order)[0];

  if (firstRealm === undefined) {
    throw new Error("Cannot create a new game without realm config.");
  }

  return firstRealm;
}

function getFirstUnlockedMap(unlockedMapIds: string[]): MapDefinition {
  const unlockedSet = new Set(unlockedMapIds);
  const firstMap = MAPS.filter((map) => unlockedSet.has(map.id)).sort(
    (first, second) => first.order - second.order
  )[0];

  if (firstMap === undefined) {
    throw new Error("Cannot create a new game without an unlocked map config.");
  }

  return firstMap;
}

export function createNewGame(characterName: string, now = Date.now()): GameSaveData {
  const playerName = characterName.trim() || "无名修士";
  const initialRealm = getFirstRealm();

  let save: GameSaveData = {
    version: CURRENT_SAVE_VERSION,
    meta: {
      version: CURRENT_SAVE_VERSION,
      slotId: createId("save"),
      playerName,
      createdAt: now,
      updatedAt: now
    },
    player: {
      id: createId("player"),
      name: playerName,
      realmId: initialRealm.id,
      level: 1,
      spiritStones: 0,
      cultivation: {
        currentCultivation: 0,
        totalCultivation: 0,
        cultivationPerSecond: initialRealm.baseStats.cultivationSpeed,
        breakthroughAttempts: 0
      },
      baseStats: { ...EMPTY_CORE_STATS },
      finalStats: {
        ...EMPTY_CORE_STATS,
        currentHp: 0
      },
      equipped: {},
      progress: {
        level: 1,
        realmId: initialRealm.id,
        unlockedMapIds: [],
        currentMapId: "",
        defeatedMonsterIds: []
      }
    },
    inventory: {
      materials: [],
      consumables: [],
      currencies: [],
      equipments: [],
      maxEquipmentCount: 100
    },
    map: {
      currentMapId: "",
      unlockedMapIds: [],
      encounter: {
        lastSearchedAt: now - 5 * 60 * 1000,
        totalEncounters: 0
      }
    },
    autoBattle: {
      enabled: true,
      defeatedCount: 0,
      recentEvents: []
    },
    logs: {
      entries: [
        {
          id: createId("log"),
          type: "system",
          message: "道途初启。",
          createdAt: now
        }
      ],
      maxEntries: 200
    },
    settings: {
      autoSaveEnabled: true,
      autoSaveIntervalMs: 10000,
      offlineRewardEnabled: true,
      offlineRewardCapMs: 8 * 60 * 60 * 1000
    },
    runtime: {
      time: {
        createdAt: now,
        updatedAt: now,
        lastSavedAt: now,
        lastActiveAt: now
      }
    },
    alchemy: {
      level: 1,
      exp: 0,
      totalAttempts: 0,
      totalSuccesses: 0
    },
    market: {
      items: [],
      lastRefreshedAt: now
    },
    estate: createInitialEstateState(),
    techniques: createInitialTechniqueState(),
    objectives: createInitialObjectiveState()
  };

  const unlockedMapIds = getUnlockedMapIds(save);
  const initialMap = getFirstUnlockedMap(unlockedMapIds);

  save = {
    ...save,
    player: {
      ...save.player,
      progress: {
        ...save.player.progress,
        unlockedMapIds,
        currentMapId: initialMap.id
      }
    },
    map: {
      ...save.map,
      currentMapId: initialMap.id,
      unlockedMapIds
    }
  };

  save.player.finalStats = calculateFinalStats(save);
  save.player.cultivation.cultivationPerSecond = save.player.finalStats.cultivationSpeed;
  save.autoBattle.playerCurrentHp = save.player.finalStats.maxHp;
  save.autoBattle.playerActionProgress = 0;
  save.autoBattle.enemyActionProgress = 0;

  return save;
}

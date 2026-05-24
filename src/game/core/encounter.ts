import type { GameSaveData, GameLogEntry } from "../types";
import { MAP_ENCOUNTER_COOLDOWN_MS, MAP_ENCOUNTERS } from "../config/encounters";
import { MAPS } from "../config/maps";
import { addItemStacks } from "./inventory";
import { createId, pickWeighted } from "./random";
import { addTechniqueFragments } from "./technique";

function appendLog(save: GameSaveData, entry: GameLogEntry): GameLogEntry[] {
  const entries = [entry, ...save.logs.entries];
  return entries.slice(0, save.logs.maxEntries);
}

function getCurrentMapOrder(save: GameSaveData): number {
  return MAPS.find((map) => map.id === save.map.currentMapId)?.order ?? 1;
}

export function getEncounterCooldownRemaining(save: GameSaveData, now = Date.now()): number {
  const elapsed = now - save.map.encounter.lastSearchedAt;
  return Math.max(0, MAP_ENCOUNTER_COOLDOWN_MS - elapsed);
}

export function isEncounterReady(save: GameSaveData, now = Date.now()): boolean {
  return getEncounterCooldownRemaining(save, now) <= 0;
}

export interface MapEncounterResult {
  save: GameSaveData;
  success: boolean;
  message: string;
}

export function searchMapEncounter(save: GameSaveData, now = Date.now()): MapEncounterResult {
  const cooldownRemaining = getEncounterCooldownRemaining(save, now);

  if (cooldownRemaining > 0) {
    return { save, success: false, message: "机缘尚未显现。" };
  }

  const currentMapOrder = getCurrentMapOrder(save);
  const availableEncounters = MAP_ENCOUNTERS.filter((encounter) => {
    const mapMatches = encounter.mapIds === undefined || encounter.mapIds.includes(save.map.currentMapId);
    const orderMatches = encounter.minMapOrder === undefined || currentMapOrder >= encounter.minMapOrder;
    return mapMatches && orderMatches;
  });
  const encounterId = pickWeighted(availableEncounters.map((encounter) => ({
    value: encounter.id,
    weight: encounter.weight
  })));
  const encounter = MAP_ENCOUNTERS.find((entry) => entry.id === encounterId) ?? availableEncounters[0];

  if (encounter === undefined) {
    return { save, success: false, message: "此地暂无线索。" };
  }

  const reward = encounter.reward;
  const damagedHp =
    encounter.hpDamagePercent === undefined
      ? save.autoBattle.playerCurrentHp
      : Math.max(
          1,
          Math.floor(
            (save.autoBattle.playerCurrentHp ?? save.player.finalStats.maxHp) -
              save.player.finalStats.maxHp * encounter.hpDamagePercent
          )
        );

  let nextSave: GameSaveData = {
    ...save,
    player: {
      ...save.player,
      spiritStones: save.player.spiritStones + (reward.spiritStones ?? 0),
      cultivation: {
        ...save.player.cultivation,
        currentCultivation: save.player.cultivation.currentCultivation + (reward.cultivation ?? 0),
        totalCultivation: save.player.cultivation.totalCultivation + (reward.cultivation ?? 0)
      }
    },
    autoBattle: {
      ...save.autoBattle,
      playerCurrentHp: damagedHp
    },
    map: {
      ...save.map,
      encounter: {
        lastSearchedAt: now,
        totalEncounters: save.map.encounter.totalEncounters + 1
      }
    },
    meta: {
      ...save.meta,
      updatedAt: now
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

  if (reward.items !== undefined && reward.items.length > 0) {
    nextSave = addItemStacks(nextSave, reward.items);
  }

  let learnedNames: string[] = [];
  if (reward.techniqueFragments !== undefined && reward.techniqueFragments.length > 0) {
    const techniqueResult = addTechniqueFragments(nextSave, reward.techniqueFragments, now);
    nextSave = techniqueResult.save;
    learnedNames = techniqueResult.learnedNames;
  }

  nextSave = {
    ...nextSave,
    logs: {
      ...nextSave.logs,
      entries: appendLog(nextSave, {
        id: createId("log"),
        type: "encounter",
        message: `${encounter.name}：${encounter.outcome}${learnedNames.length > 0 ? ` 参悟${learnedNames.join("、")}。` : ""}`,
        createdAt: now,
        payload: {
          encounterId: encounter.id
        }
      })
    }
  };

  return {
    save: nextSave,
    success: true,
    message: `${encounter.name}：${encounter.outcome}${learnedNames.length > 0 ? ` 参悟${learnedNames.join("、")}。` : ""}`
  };
}

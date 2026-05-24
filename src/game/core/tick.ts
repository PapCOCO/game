import type { GameSaveData } from "../types";
import { EQUIPMENT_TEMPLATES, ITEMS } from "../config";
import { applyCultivationGain } from "./cultivation";
import { advanceBattleTime, appendRecentCombatEvent, resolveBattleRound } from "./combat";
import { applyLootToSave } from "./inventory";
import { generateLoot, type LootResult } from "./loot";
import { createId } from "./random";
import { updateObjectives } from "./objectives";

const MAX_TICK_SECONDS = 10;
const MAX_ATTACK_EVENTS_PER_TICK = 5;

function appendLog(
  save: GameSaveData,
  type: "battle" | "drop",
  message: string,
  now: number
): GameSaveData {
  return {
    ...save,
    logs: {
      ...save.logs,
      entries: [
        {
          id: createId("log"),
          type,
          message,
          createdAt: now
        },
        ...save.logs.entries
      ].slice(0, save.logs.maxEntries)
    }
  };
}

function describeLoot(loot: LootResult): string {
  const parts: string[] = [];

  if (loot.spiritStones > 0) {
    parts.push(`灵石 x${loot.spiritStones}`);
  }

  if (loot.cultivation > 0) {
    parts.push(`修为 x${loot.cultivation}`);
  }

  for (const item of loot.items) {
    const itemDefinition = ITEMS.find((definition) => definition.id === item.itemId);
    parts.push(`${itemDefinition?.name ?? item.itemId} x${item.quantity}`);
  }

  for (const equipment of loot.equipments) {
    const template = EQUIPMENT_TEMPLATES.find((definition) => definition.id === equipment.equipmentId);
    parts.push(`${template?.name ?? equipment.name} x1`);
  }

  return parts.length > 0 ? `获得 ${parts.join("、")}。` : "未获得掉落。";
}

function resolveAutoBattleRounds(
  save: GameSaveData,
  now: number,
  fallbackLastAttackAt: number
): GameSaveData {
  if (!save.autoBattle.enabled) {
    return save;
  }

  const lastAttackAt =
    save.autoBattle.lastAttackAt ?? save.autoBattle.battleStartedAt ?? fallbackLastAttackAt;
  const elapsedBattleSeconds = Math.max(0, (now - lastAttackAt) / 1000);

  if (elapsedBattleSeconds <= 0) {
    return {
      ...save,
      autoBattle: {
        ...save.autoBattle,
        battleStartedAt: save.autoBattle.battleStartedAt ?? now
      }
    };
  }

  const advanced = advanceBattleTime(save, Math.min(elapsedBattleSeconds, MAX_TICK_SECONDS), now);
  let nextSave = advanced.save;

  if (advanced.summary?.type === "recovered") {
    nextSave = appendRecentCombatEvent(nextSave, "recover", advanced.summary.message, now);
    nextSave = appendLog(nextSave, "battle", advanced.summary.message, now);
  }

  for (let index = 0; index < MAX_ATTACK_EVENTS_PER_TICK; index += 1) {
    const roundTime = now;
    const result = resolveBattleRound(nextSave, roundTime);

    nextSave = result.save;

    if (result.summary.type === "none" || result.summary.type === "recovering") {
      break;
    }

    if (result.summary.type === "player_attack") {
      nextSave = appendRecentCombatEvent(nextSave, "player-hit", result.summary.message, roundTime);
    }

    if (result.summary.type === "enemy_attack") {
      nextSave = appendRecentCombatEvent(nextSave, "enemy-hit", result.summary.message, roundTime);
    }

    if (result.summary.type === "enemy_defeated" && result.summary.monsterId !== undefined) {
      const loot = generateLoot(result.summary.monsterId, roundTime);
      nextSave = applyLootToSave(nextSave, loot, roundTime);
      nextSave = appendRecentCombatEvent(nextSave, "victory", result.summary.message, roundTime);
      nextSave = appendLog(nextSave, "battle", result.summary.message, roundTime);
      nextSave = appendRecentCombatEvent(nextSave, "loot", describeLoot(loot), roundTime);
      nextSave = appendLog(nextSave, "drop", describeLoot(loot), roundTime);
      nextSave = {
        ...nextSave,
        player: {
          ...nextSave.player,
          progress: {
            ...nextSave.player.progress,
            defeatedMonsterIds: [
              ...new Set([...nextSave.player.progress.defeatedMonsterIds, result.summary.monsterId])
            ]
          }
        },
        autoBattle: {
          ...nextSave.autoBattle,
          currentEnemy: undefined,
          enemyActionProgress: 0,
          defeatedCount: nextSave.autoBattle.defeatedCount + 1
        }
      };
      nextSave = updateObjectives(nextSave, { type: "defeat", amount: 1 });
      nextSave = updateObjectives(nextSave, { type: "collect" });
      nextSave = updateObjectives(nextSave, { type: "cultivation" });
    }

    if (result.summary.type === "player_defeated") {
      nextSave = appendRecentCombatEvent(nextSave, "recover", result.summary.message, roundTime);
      nextSave = appendLog(nextSave, "battle", result.summary.message, roundTime);
    }
  }

  return {
    ...nextSave,
    autoBattle: {
      ...nextSave.autoBattle,
      battleStartedAt: nextSave.autoBattle.battleStartedAt ?? now,
      lastAttackAt: now
    }
  };
}

export function tickGame(save: GameSaveData, now = Date.now()): GameSaveData {
  const elapsedMs = now - save.runtime.time.lastActiveAt;

  if (elapsedMs <= 0) {
    return save;
  }

  const elapsedSeconds = Math.min(elapsedMs / 1000, MAX_TICK_SECONDS);
  const cultivatedSave = applyCultivationGain(save, elapsedSeconds, now);
  const objectiveSave = updateObjectives(cultivatedSave, { type: "cultivation" });

  return resolveAutoBattleRounds(objectiveSave, now, save.runtime.time.lastActiveAt);
}

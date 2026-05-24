import type { GameSaveData } from "../types";
import { applyCultivationGain } from "./cultivation";
import { resolveCombat } from "./combat";
import { applyLootToSave } from "./inventory";
import { generateLoot, type LootResult } from "./loot";
import { createId } from "./random";
import { EQUIPMENT_TEMPLATES, ITEMS } from "../config";

const MAX_TICK_SECONDS = 10;
const BATTLE_INTERVAL_MS = 5000;
const MAX_BATTLES_PER_TICK = 2;

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

function resolveAutoBattles(save: GameSaveData, now: number, fallbackLastAttackAt: number): GameSaveData {
  if (!save.autoBattle.enabled) {
    return save;
  }

  const lastAttackAt =
    save.autoBattle.lastAttackAt ?? save.autoBattle.battleStartedAt ?? fallbackLastAttackAt;
  const elapsedBattleMs = now - lastAttackAt;
  const battleCount = Math.min(
    MAX_BATTLES_PER_TICK,
    Math.max(0, Math.floor(elapsedBattleMs / BATTLE_INTERVAL_MS))
  );

  if (battleCount <= 0) {
    return {
      ...save,
      autoBattle: {
        ...save.autoBattle,
        battleStartedAt: save.autoBattle.battleStartedAt ?? now
      }
    };
  }

  let nextSave = save;

  for (let index = 0; index < battleCount; index += 1) {
    const battleTime = Math.min(now, lastAttackAt + BATTLE_INTERVAL_MS * (index + 1));
    const combatResult = resolveCombat(nextSave, battleTime);

    if (!combatResult.won || combatResult.monsterId === null) {
      nextSave = appendLog(nextSave, "battle", combatResult.message, battleTime);
      continue;
    }

    const loot = generateLoot(combatResult.monsterId, battleTime);
    nextSave = applyLootToSave(nextSave, loot, battleTime);
    nextSave = appendLog(nextSave, "battle", combatResult.message, battleTime);
    nextSave = appendLog(nextSave, "drop", describeLoot(loot), battleTime);
    nextSave = {
      ...nextSave,
      player: {
        ...nextSave.player,
        progress: {
          ...nextSave.player.progress,
          defeatedMonsterIds: combatResult.monsterId
            ? [...new Set([...nextSave.player.progress.defeatedMonsterIds, combatResult.monsterId])]
            : nextSave.player.progress.defeatedMonsterIds
        }
      },
      autoBattle: {
        ...nextSave.autoBattle,
        defeatedCount: nextSave.autoBattle.defeatedCount + 1
      }
    };
  }

  return {
    ...nextSave,
    autoBattle: {
      ...nextSave.autoBattle,
      battleStartedAt: nextSave.autoBattle.battleStartedAt ?? now,
      lastAttackAt: Math.min(now, lastAttackAt + BATTLE_INTERVAL_MS * battleCount)
    }
  };
}

export function tickGame(save: GameSaveData, now = Date.now()): GameSaveData {
  const elapsedMs = now - save.runtime.time.lastActiveAt;

  if (elapsedMs <= 0) {
    return save;
  }

  const elapsedSeconds = Math.min(elapsedMs / 1000, MAX_TICK_SECONDS);

  return resolveAutoBattles(applyCultivationGain(save, elapsedSeconds, now), now, save.runtime.time.lastActiveAt);
}

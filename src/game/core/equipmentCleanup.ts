import type { GameSaveData, Rarity } from "../types";
import { calculateEquipmentScore } from "./equipment";
import { appendLog, touchSave } from "./saveUtils";

export interface DiscardLowScoreOptions {
  maxScore: number;
  keepRarityAtOrAbove?: Rarity;
}

const RARITY_ORDER: Record<Rarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5
};

function shouldKeepByRarity(rarity: Rarity, keepRarityAtOrAbove: Rarity | undefined): boolean {
  if (keepRarityAtOrAbove === undefined) {
    return false;
  }

  return RARITY_ORDER[rarity] >= RARITY_ORDER[keepRarityAtOrAbove];
}

export function discardLowScoreEquipments(
  save: GameSaveData,
  options: DiscardLowScoreOptions,
  now = Date.now()
): { save: GameSaveData; removedCount: number; message: string } {
  const equippedIds = new Set(Object.values(save.player.equipped));
  const removed = save.inventory.equipments.filter((equipment) => {
    if (equippedIds.has(equipment.instanceId) || equipment.locked) {
      return false;
    }

    if (shouldKeepByRarity(equipment.rarity, options.keepRarityAtOrAbove)) {
      return false;
    }

    return calculateEquipmentScore(equipment) <= options.maxScore;
  });

  if (removed.length === 0) {
    return {
      save,
      removedCount: 0,
      message: "没有符合条件的低评分装备。"
    };
  }

  let nextSave: GameSaveData = {
    ...save,
    inventory: {
      ...save.inventory,
      equipments: save.inventory.equipments.filter(
        (equipment) => !removed.some((item) => item.instanceId === equipment.instanceId)
      )
    }
  };

  nextSave = touchSave(nextSave, now);
  nextSave = appendLog(nextSave, "equipment", `已清理低评分装备 ${removed.length} 件。`, now);

  return {
    save: nextSave,
    removedCount: removed.length,
    message: `已清理低评分装备 ${removed.length} 件。`
  };
}

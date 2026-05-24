import type { EnhancementResult, GameSaveData } from "../types";
import { ENHANCEMENT_CONFIG, MAX_ENHANCEMENT_LEVEL } from "../config";
import { randomChance } from "./random";
import { getEquipmentByInstanceId, calculateFinalStats } from "./selectors";
import { removeItem } from "./inventory";
import { appendLog, touchSave } from "./saveUtils";

function hasEnoughMaterials(save: GameSaveData, targetLevel: number): boolean {
  const config = ENHANCEMENT_CONFIG[targetLevel - 1];
  if (config === undefined) return false;

  if (save.player.spiritStones < config.spiritStoneCost) {
    return false;
  }

  for (const mat of config.materials) {
    const quantity = save.inventory.materials.find((m) => m.itemId === mat.itemId)?.quantity ?? 0;
    if (quantity < mat.quantity) {
      return false;
    }
  }

  return true;
}

function consumeMaterials(save: GameSaveData, targetLevel: number): GameSaveData {
  const config = ENHANCEMENT_CONFIG[targetLevel - 1];
  if (config === undefined) return save;

  let newSave: GameSaveData = {
    ...save,
    player: {
      ...save.player,
      spiritStones: save.player.spiritStones - config.spiritStoneCost
    }
  };

  for (const mat of config.materials) {
    newSave = removeItem(newSave, mat.itemId, mat.quantity);
  }

  return newSave;
}

export function enhanceEquipment(
  save: GameSaveData,
  equipmentInstanceId: string,
  now = Date.now()
): EnhancementResult {
  const equipment = getEquipmentByInstanceId(save, equipmentInstanceId);
  if (equipment === undefined) {
    return { save, success: false, newLevel: 0, message: "装备不存在。" };
  }

  const currentLevel = equipment.enhancement ?? 0;

  if (currentLevel >= MAX_ENHANCEMENT_LEVEL) {
    const message = `${equipment.name}已达到强化上限。`;
    return {
      save: appendLog(save, "equipment", message, now),
      success: false,
      newLevel: currentLevel,
      message
    };
  }

  const targetLevel = currentLevel + 1;

  if (!hasEnoughMaterials(save, targetLevel)) {
    const message = `材料不足，无法强化${equipment.name}。`;
    return {
      save: appendLog(save, "equipment", message, now),
      success: false,
      newLevel: currentLevel,
      message
    };
  }

  const config = ENHANCEMENT_CONFIG[targetLevel - 1];
  if (config === undefined) {
    return { save, success: false, newLevel: currentLevel, message: "强化配置不存在。" };
  }

  let newSave = consumeMaterials(save, targetLevel);
  const success = randomChance(config.successRate);
  const message = success
    ? `${equipment.name}强化成功！达到+${targetLevel}。`
    : `${equipment.name}强化失败，材料与灵石已消耗。`;

  if (success) {
    const equipments = newSave.inventory.equipments.map((eq) =>
      eq.instanceId === equipmentInstanceId
        ? { ...eq, enhancement: (eq.enhancement ?? 0) + 1 }
        : eq
    );
    newSave = { ...newSave, inventory: { ...newSave.inventory, equipments } };
  }

  newSave = appendLog(newSave, "equipment", message, now);
  newSave = touchSave(newSave, now);
  newSave = {
    ...newSave,
    player: {
      ...newSave.player,
      finalStats: calculateFinalStats(newSave)
    }
  };

  return {
    save: newSave,
    success,
    newLevel: success ? targetLevel : currentLevel,
    message
  };
}

export function canEnhance(
  save: GameSaveData,
  equipmentInstanceId: string
): { can: boolean; reason: string } {
  const equipment = getEquipmentByInstanceId(save, equipmentInstanceId);
  if (equipment === undefined) {
    return { can: false, reason: "装备不存在" };
  }

  if (equipment.enhancement >= MAX_ENHANCEMENT_LEVEL) {
    return { can: false, reason: "已达上限" };
  }

  const targetLevel = equipment.enhancement + 1;

  if (!hasEnoughMaterials(save, targetLevel)) {
    return { can: false, reason: "材料不足" };
  }

  return { can: true, reason: "" };
}

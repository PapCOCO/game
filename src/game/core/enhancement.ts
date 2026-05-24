import type { CoreStats, EnhancementResult, GameSaveData } from "../types";
import { ENHANCEMENT_CONFIG, MAX_ENHANCEMENT_LEVEL } from "../config";
import { randomChance } from "./random";
import { getEquipmentByInstanceId, calculateFinalStats } from "./selectors";
import { appendEquipmentLog, touchSave } from "./equipment";
import { removeItem, addItem } from "./inventory";

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
  let newSave = { ...save };
  const config = ENHANCEMENT_CONFIG[targetLevel - 1];
  if (config === undefined) return newSave;

  newSave.player.spiritStones -= config.spiritStoneCost;

  for (const mat of config.materials) {
    newSave = removeItem(newSave, mat.itemId, mat.quantity);
  }

  return newSave;
}

export function enhanceEquipment(
  save: GameSaveData,
  equipmentInstanceId: string,
  now = Date.now()
): GameSaveData {
  const equipment = getEquipmentByInstanceId(save, equipmentInstanceId);
  if (equipment === undefined) {
    return save;
  }

  if (equipment.enhancement >= MAX_ENHANCEMENT_LEVEL) {
    return appendEquipmentLog(save, `${equipment.name}已达到强化上限。`, now);
  }

  const targetLevel = equipment.enhancement + 1;

  if (!hasEnoughMaterials(save, targetLevel)) {
    return appendEquipmentLog(save, `材料不足，无法强化${equipment.name}。`, now);
  }

  const config = ENHANCEMENT_CONFIG[targetLevel - 1];
  if (config === undefined) {
    return save;
  }

  let newSave = consumeMaterials(save, targetLevel);
  const success = randomChance(config.successRate);

  if (success) {
    const equipments = newSave.inventory.equipments.map((eq) =>
      eq.instanceId === equipmentInstanceId
        ? { ...eq, enhancement: eq.enhancement + 1 }
        : eq
    );
    newSave = { ...newSave, inventory: { ...newSave.inventory, equipments } };
    newSave = appendEquipmentLog(newSave, `${equipment.name}强化成功！达到+${targetLevel}。`, now);
  } else {
    newSave = appendEquipmentLog(newSave, `${equipment.name}强化失败……`, now);
  }

  newSave = touchSave(newSave, now);
  newSave = {
    ...newSave,
    player: {
      ...newSave.player,
      finalStats: calculateFinalStats(newSave)
    }
  };

  return newSave;
}

export function getEnhancementStats(
  baseStats: Partial<CoreStats>,
  enhancement: number
): Partial<CoreStats> {
  if (enhancement <= 0) return baseStats;

  const config = ENHANCEMENT_CONFIG[enhancement - 1];
  if (config === undefined) return baseStats;

  const result: Partial<CoreStats> = {};
  for (const [stat, value] of Object.entries(baseStats) as Array<[keyof CoreStats, number]>) {
    result[stat] = Math.round(value * config.attributeMultiplier * 100) / 100;
  }

  return result;
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

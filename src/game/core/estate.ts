import type { GameSaveData, EstateState, SpiritFieldState, SpiritVeinState, GatheringArrayState } from "../types";
import { ESTATE_CONFIG } from "../config/estate";
import { addItem } from "./inventory";
import { createId } from "./random";

interface UpgradeCost {
  spiritStones: number;
  materials: Array<{ itemId: string; quantity: number }>;
}

function getUpgradeCost(facility: "spiritField" | "spiritVein" | "gatheringArray", currentLevel: number): UpgradeCost {
  const costs = ESTATE_CONFIG[facility].upgradeCosts as unknown as UpgradeCost[];
  return costs[currentLevel] ?? costs[costs.length - 1];
}

function hasEnoughResources(save: GameSaveData, cost: UpgradeCost): boolean {
  if (save.player.spiritStones < cost.spiritStones) return false;
  for (const material of cost.materials) {
    const have = save.inventory.materials.find((m) => m.itemId === material.itemId)?.quantity ?? 0;
    if (have < material.quantity) return false;
  }
  return true;
}

function deductResources(save: GameSaveData, cost: UpgradeCost): GameSaveData {
  let nextSave = {
    ...save,
    player: {
      ...save.player,
      spiritStones: save.player.spiritStones - cost.spiritStones
    }
  };

  for (const material of cost.materials) {
    const inventoryItem = nextSave.inventory.materials.find((m) => m.itemId === material.itemId);
    if (inventoryItem !== undefined) {
      const newQuantity = inventoryItem.quantity - material.quantity;
      if (newQuantity <= 0) {
        nextSave = {
          ...nextSave,
          inventory: {
            ...nextSave.inventory,
            materials: nextSave.inventory.materials.filter((m) => m.itemId !== material.itemId)
          }
        };
      } else {
        nextSave = {
          ...nextSave,
          inventory: {
            ...nextSave.inventory,
            materials: nextSave.inventory.materials.map((m) =>
              m.itemId === material.itemId ? { ...m, quantity: newQuantity } : m
            )
          }
        };
      }
    }
  }

  return nextSave;
}

function appendLog(save: GameSaveData, type: "estate", message: string, now: number): GameSaveData {
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

export function getFieldHarvestTime(fieldLevel: number): number {
  const reduction = 1 - (fieldLevel - 1) * ESTATE_CONFIG.spiritField.harvestTimeReductionPerLevel;
  return Math.max(60000, ESTATE_CONFIG.spiritField.baseHarvestTimeMs * reduction);
}

export function getFieldCropQuantity(fieldLevel: number): number {
  return ESTATE_CONFIG.spiritField.baseCropQuantity + (fieldLevel - 1) * ESTATE_CONFIG.spiritField.quantityBonusPerLevel;
}

export function getAvailableCrops(estateLevel: number) {
  return ESTATE_CONFIG.spiritField.crops.filter((crop) => crop.levelRequired <= estateLevel);
}

export function getVeinCultivationPerMinute(veinLevel: number): number {
  return ESTATE_CONFIG.spiritVein.baseCultivationPerMinute + (veinLevel - 1) * ESTATE_CONFIG.spiritVein.cultivationBonusPerLevel;
}

export function getGatheringBonusPercent(arrayLevel: number): number {
  return ESTATE_CONFIG.gatheringArray.baseBonusPercent + (arrayLevel - 1) * ESTATE_CONFIG.gatheringArray.bonusPerLevel;
}

export function calculateAccumulatedCultivation(vein: SpiritVeinState, now: number): number {
  if (!vein.unlocked || vein.level <= 0) return 0;
  const elapsedMinutes = (now - vein.lastCollectedAt) / 60000;
  const perMinute = getVeinCultivationPerMinute(vein.level);
  return Math.min(ESTATE_CONFIG.spiritVein.maxAccumulatedCultivation, vein.accumulatedCultivation + elapsedMinutes * perMinute);
}

export function isFieldReady(field: SpiritFieldState, now: number): boolean {
  if (field.harvestReadyAt === null || field.cropItemId === null) return false;
  return now >= field.harvestReadyAt;
}

export function getFieldTimeRemaining(field: SpiritFieldState, now: number): number {
  if (field.harvestReadyAt === null) return 0;
  return Math.max(0, field.harvestReadyAt - now);
}

export function upgradeFacility(
  save: GameSaveData,
  facilityType: "spiritField" | "spiritVein" | "gatheringArray",
  fieldIndex?: number,
  now = Date.now()
): { save: GameSaveData; success: boolean; message: string } {
  const estate = save.estate;

  if (facilityType === "spiritField" && fieldIndex !== undefined) {
    const field = estate.spiritFields[fieldIndex];
    if (field === undefined) return { save, success: false, message: "灵田不存在。" };
    if (field.level >= ESTATE_CONFIG.spiritField.maxLevel) return { save, success: false, message: "灵田已达最高等级。" };

    const cost = getUpgradeCost("spiritField", field.level);
    if (!hasEnoughResources(save, cost)) return { save, success: false, message: "资源不足，无法升级灵田。" };

    let nextSave = deductResources(save, cost);
    const newLevel = field.level + 1;
    const updatedFields = [...estate.spiritFields];
    updatedFields[fieldIndex] = { ...field, level: newLevel };

    nextSave = {
      ...nextSave,
      estate: {
        ...estate,
        spiritFields: updatedFields,
        exp: estate.exp + ESTATE_CONFIG.estateExpPerUpgrade
      }
    };

    nextSave = appendLog(nextSave, "estate", `灵田升级至 ${newLevel} 级。`, now);
    return { save: nextSave, success: true, message: `灵田升级至 ${newLevel} 级。` };
  }

  if (facilityType === "spiritVein") {
    if (!estate.spiritVein.unlocked) {
      const cost = getUpgradeCost("spiritVein", 0);
      if (!hasEnoughResources(save, cost)) return { save, success: false, message: "资源不足，无法解锁灵脉。" };

      let nextSave = deductResources(save, cost);
      nextSave = {
        ...nextSave,
        estate: {
          ...estate,
          spiritVein: {
            ...estate.spiritVein,
            unlocked: true,
            level: 1,
            lastCollectedAt: now
          },
          exp: estate.exp + ESTATE_CONFIG.estateExpPerUpgrade
        }
      };

      nextSave = appendLog(nextSave, "estate", "灵脉已开启，可自动积累修为。", now);
      return { save: nextSave, success: true, message: "灵脉已开启。" };
    }

    if (estate.spiritVein.level >= ESTATE_CONFIG.spiritVein.maxLevel) {
      return { save, success: false, message: "灵脉已达最高等级。" };
    }

    const cost = getUpgradeCost("spiritVein", estate.spiritVein.level);
    if (!hasEnoughResources(save, cost)) return { save, success: false, message: "资源不足，无法升级灵脉。" };

    let nextSave = deductResources(save, cost);
    const newLevel = estate.spiritVein.level + 1;

    nextSave = {
      ...nextSave,
      estate: {
        ...estate,
        spiritVein: {
          ...estate.spiritVein,
          level: newLevel
        },
        exp: estate.exp + ESTATE_CONFIG.estateExpPerUpgrade
      }
    };

    nextSave = appendLog(nextSave, "estate", `灵脉升级至 ${newLevel} 级。`, now);
    return { save: nextSave, success: true, message: `灵脉升级至 ${newLevel} 级。` };
  }

  if (facilityType === "gatheringArray") {
    if (!estate.gatheringArray.unlocked) {
      const cost = getUpgradeCost("gatheringArray", 0);
      if (!hasEnoughResources(save, cost)) return { save, success: false, message: "资源不足，无法解锁聚灵阵。" };

      let nextSave = deductResources(save, cost);
      nextSave = {
        ...nextSave,
        estate: {
          ...estate,
          gatheringArray: {
            ...estate.gatheringArray,
            unlocked: true,
            level: 1,
            cultivationBonusPercent: getGatheringBonusPercent(1)
          },
          exp: estate.exp + ESTATE_CONFIG.estateExpPerUpgrade
        }
      };

      nextSave = appendLog(nextSave, "estate", "聚灵阵已开启，修炼效率提升。", now);
      return { save: nextSave, success: true, message: "聚灵阵已开启。" };
    }

    if (estate.gatheringArray.level >= ESTATE_CONFIG.gatheringArray.maxLevel) {
      return { save, success: false, message: "聚灵阵已达最高等级。" };
    }

    const cost = getUpgradeCost("gatheringArray", estate.gatheringArray.level);
    if (!hasEnoughResources(save, cost)) return { save, success: false, message: "资源不足，无法升级聚灵阵。" };

    let nextSave = deductResources(save, cost);
    const newLevel = estate.gatheringArray.level + 1;

    nextSave = {
      ...nextSave,
      estate: {
        ...estate,
        gatheringArray: {
          ...estate.gatheringArray,
          level: newLevel,
          cultivationBonusPercent: getGatheringBonusPercent(newLevel)
        },
        exp: estate.exp + ESTATE_CONFIG.estateExpPerUpgrade
      }
    };

    nextSave = appendLog(nextSave, "estate", `聚灵阵升级至 ${newLevel} 级。`, now);
    return { save: nextSave, success: true, message: `聚灵阵升级至 ${newLevel} 级。` };
  }

  return { save, success: false, message: "未知设施。" };
}

export function plantField(
  save: GameSaveData,
  fieldIndex: number,
  cropItemId: string,
  now = Date.now()
): { save: GameSaveData; success: boolean; message: string } {
  const estate = save.estate;
  const field = estate.spiritFields[fieldIndex];

  if (field === undefined) return { save, success: false, message: "灵田不存在。" };
  if (!field.unlocked) return { save, success: false, message: "灵田尚未解锁。" };
  if (field.cropItemId !== null) return { save, success: false, message: "灵田已有作物。" };

  const availableCrops = getAvailableCrops(estate.level);
  const crop = availableCrops.find((c) => c.itemId === cropItemId);
  if (crop === undefined) return { save, success: false, message: "该作物尚未解锁。" };

  const harvestTime = getFieldHarvestTime(field.level);
  const quantity = getFieldCropQuantity(field.level);

  const updatedFields = [...estate.spiritFields];
  updatedFields[fieldIndex] = {
    ...field,
    plantedAt: now,
    cropItemId,
    cropQuantity: quantity,
    harvestReadyAt: now + harvestTime
  };

  const nextSave: GameSaveData = {
    ...save,
    estate: {
      ...estate,
      spiritFields: updatedFields
    }
  };

  return { save: nextSave, success: true, message: `已在灵田种植 ${crop.name}。` };
}

export function harvestField(
  save: GameSaveData,
  fieldIndex: number,
  now = Date.now()
): { save: GameSaveData; success: boolean; message: string } {
  const estate = save.estate;
  const field = estate.spiritFields[fieldIndex];

  if (field === undefined) return { save, success: false, message: "灵田不存在。" };
  if (field.cropItemId === null) return { save, success: false, message: "灵田尚未种植。" };
  if (!isFieldReady(field, now)) return { save, success: false, message: "作物尚未成熟。" };

  const updatedInventory = addItem(save.inventory, field.cropItemId, field.cropQuantity);

  let nextSave: GameSaveData = {
    ...save,
    inventory: updatedInventory,
    estate: {
      ...estate,
      spiritFields: estate.spiritFields.map((f, index) =>
        index === fieldIndex
          ? { ...f, plantedAt: null, cropItemId: null, cropQuantity: 0, harvestReadyAt: null }
          : f
      )
    }
  };

  const cropName = ESTATE_CONFIG.spiritField.crops.find((c) => c.itemId === field.cropItemId)?.name ?? field.cropItemId;
  nextSave = appendLog(nextSave, "estate", `收获 ${cropName} x${field.cropQuantity}。`, now);

  return { save: nextSave, success: true, message: `收获 ${cropName} x${field.cropQuantity}。` };
}

export function collectVeinCultivation(
  save: GameSaveData,
  now = Date.now()
): { save: GameSaveData; success: boolean; message: string } {
  const estate = save.estate;

  if (!estate.spiritVein.unlocked) return { save, success: false, message: "灵脉尚未开启。" };

  const accumulated = calculateAccumulatedCultivation(estate.spiritVein, now);
  if (accumulated < 1) return { save, success: false, message: "灵脉积累的修为不足。" };

  const roundedAmount = Math.floor(accumulated);

  let nextSave: GameSaveData = {
    ...save,
    player: {
      ...save.player,
      cultivation: {
        ...save.player.cultivation,
        currentCultivation: save.player.cultivation.currentCultivation + roundedAmount,
        totalCultivation: save.player.cultivation.totalCultivation + roundedAmount
      }
    },
    estate: {
      ...estate,
      spiritVein: {
        ...estate.spiritVein,
        accumulatedCultivation: accumulated - roundedAmount,
        lastCollectedAt: now
      }
    }
  };

  nextSave = appendLog(nextSave, "estate", `从灵脉收取 ${roundedAmount} 点修为。`, now);

  return { save: nextSave, success: true, message: `从灵脉收取 ${roundedAmount} 点修为。` };
}

export function getEstateLevelFromExp(exp: number): number {
  const requirements = ESTATE_CONFIG.estateLevelRequirements;
  for (let i = requirements.length - 1; i >= 0; i--) {
    if (exp >= requirements[i]) return i + 1;
  }
  return 1;
}

export function createInitialEstateState(): EstateState {
  const now = Date.now();
  return {
    level: 1,
    exp: 0,
    spiritFields: [
      {
        definitionId: "facility.spirit_field",
        level: 1,
        unlocked: true,
        plantedAt: null,
        cropItemId: null,
        cropQuantity: 0,
        harvestReadyAt: null
      },
      {
        definitionId: "facility.spirit_field",
        level: 1,
        unlocked: false,
        plantedAt: null,
        cropItemId: null,
        cropQuantity: 0,
        harvestReadyAt: null
      },
      {
        definitionId: "facility.spirit_field",
        level: 1,
        unlocked: false,
        plantedAt: null,
        cropItemId: null,
        cropQuantity: 0,
        harvestReadyAt: null
      }
    ],
    spiritVein: {
      definitionId: "facility.spirit_vein",
      level: 0,
      unlocked: false,
      accumulatedCultivation: 0,
      lastCollectedAt: now
    },
    gatheringArray: {
      definitionId: "facility.gathering_array",
      level: 0,
      unlocked: false,
      cultivationBonusPercent: 0
    }
  };
}

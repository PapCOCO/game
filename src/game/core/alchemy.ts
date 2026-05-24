import type { GameSaveData, AlchemyState, PillRecipe, GameLogEntry } from "../types";
import { RECIPES } from "../config/recipes";
import { ITEMS } from "../config/items";
import { randomChance } from "./random";
import { createId } from "./random";
import { addItem } from "./inventory";

const ALCHEMY_EXP_PER_ATTEMPT = 10;
const ALCHEMY_EXP_PER_SUCCESS = 25;
const ALCHEMY_LEVEL_EXP_REQUIREMENTS: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 900,
  6: 1500,
  7: 2400,
  8: 3700,
  9: 5500,
  10: 8000
};

export function getAlchemyLevelExpRequirement(level: number): number {
  return ALCHEMY_LEVEL_EXP_REQUIREMENTS[level] ?? ALCHEMY_LEVEL_EXP_REQUIREMENTS[10] * 2;
}

export function calculateSuccessRate(recipe: PillRecipe, alchemyLevel: number): number {
  const levelDiff = alchemyLevel - recipe.requiredAlchemyLevel;
  let bonus = 0;

  if (levelDiff >= 3) {
    bonus = 0.15;
  } else if (levelDiff === 2) {
    bonus = 0.1;
  } else if (levelDiff === 1) {
    bonus = 0.05;
  } else if (levelDiff === 0) {
    bonus = 0;
  } else {
    bonus = levelDiff * 0.1;
  }

  return Math.min(0.99, Math.max(0.1, recipe.baseSuccessRate + bonus));
}

function appendLog(save: GameSaveData, entry: GameLogEntry): GameLogEntry[] {
  const entries = [...save.logs.entries, entry];

  if (entries.length > save.logs.maxEntries) {
    entries.shift();
  }

  return entries;
}

export interface AlchemyResult {
  save: GameSaveData;
  success: boolean;
  message: string;
}

export function craftPill(save: GameSaveData, recipeId: string, now = Date.now()): AlchemyResult {
  const recipe = RECIPES.find((r) => r.id === recipeId);

  if (recipe === undefined) {
    return { save, success: false, message: "丹方不存在。" };
  }

  if (save.alchemy.level < recipe.requiredAlchemyLevel) {
    return {
      save,
      success: false,
      message: `炼丹等级不足，需要炼丹等级 ${recipe.requiredAlchemyLevel}。`
    };
  }

  if (save.player.spiritStones < recipe.spiritStoneCost) {
    return { save, success: false, message: "灵石不足。" };
  }

  for (const material of recipe.materials) {
    const inventoryItem = save.inventory.materials.find((item) => item.itemId === material.itemId);

    if (inventoryItem === undefined || inventoryItem.quantity < material.quantity) {
      const itemDef = ITEMS.find((def) => def.id === material.itemId);
      return {
        save,
        success: false,
        message: `材料不足：${itemDef?.name ?? material.itemId}。`
      };
    }
  }

  let nextSave = {
    ...save,
    player: {
      ...save.player,
      spiritStones: save.player.spiritStones - recipe.spiritStoneCost
    }
  };

  for (const material of recipe.materials) {
    const inventoryItem = nextSave.inventory.materials.find((item) => item.itemId === material.itemId);

    if (inventoryItem !== undefined) {
      const newQuantity = inventoryItem.quantity - material.quantity;

      if (newQuantity <= 0) {
        nextSave = {
          ...nextSave,
          inventory: {
            ...nextSave.inventory,
            materials: nextSave.inventory.materials.filter((item) => item.itemId !== material.itemId)
          }
        };
      } else {
        nextSave = {
          ...nextSave,
          inventory: {
            ...nextSave.inventory,
            materials: nextSave.inventory.materials.map((item) =>
              item.itemId === material.itemId ? { ...item, quantity: newQuantity } : item
            )
          }
        };
      }
    }
  }

  const successRate = calculateSuccessRate(recipe, nextSave.alchemy.level);
  const roll = randomChance(successRate);

  let newAlchemy: AlchemyState = {
    ...nextSave.alchemy,
    totalAttempts: nextSave.alchemy.totalAttempts + 1,
    exp: nextSave.alchemy.exp + ALCHEMY_EXP_PER_ATTEMPT
  };

  if (roll) {
    newAlchemy = {
      ...newAlchemy,
      totalSuccesses: newAlchemy.totalSuccesses + 1,
      exp: newAlchemy.exp + ALCHEMY_EXP_PER_SUCCESS
    };

    const currentLevelReq = getAlchemyLevelExpRequirement(newAlchemy.level);
    const nextLevelReq = getAlchemyLevelExpRequirement(newAlchemy.level + 1);

    if (newAlchemy.exp >= nextLevelReq && newAlchemy.level < 10) {
      newAlchemy = {
        ...newAlchemy,
        level: newAlchemy.level + 1
      };
    }

    nextSave = {
      ...nextSave,
      alchemy: newAlchemy,
      inventory: addItem(nextSave.inventory, recipe.outputItemId, 1),
      logs: {
        ...nextSave.logs,
        entries: appendLog(nextSave, {
          id: createId("log"),
          type: "alchemy",
          message: `炼丹成功！获得 ${recipe.name}。`,
          createdAt: now
        })
      },
      runtime: {
        ...nextSave.runtime,
        time: {
          ...nextSave.runtime.time,
          updatedAt: now,
          lastActiveAt: now
        }
      }
    };

    return {
      save: nextSave,
      success: true,
      message: `炼丹成功！获得 ${recipe.name}。`
    };
  }

  nextSave = {
    ...nextSave,
    alchemy: newAlchemy,
    logs: {
      ...nextSave.logs,
      entries: appendLog(nextSave, {
        id: createId("log"),
        type: "alchemy",
        message: `炼丹失败，材料化为灰烬。`,
        createdAt: now
      })
    },
    runtime: {
      ...nextSave.runtime,
      time: {
        ...nextSave.runtime.time,
        updatedAt: now,
        lastActiveAt: now
      }
    }
  };

  return {
    save: nextSave,
    success: false,
    message: `炼丹失败，材料化为灰烬。成功率：${(successRate * 100).toFixed(0)}%。`
  };
}

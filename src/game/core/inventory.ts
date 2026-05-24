import type { EquipmentInstance, GameSaveData, ItemStack, InventoryState } from "../types";
import type { LootResult } from "./loot";
import { ITEMS } from "../config";
import { calculateFinalStats } from "./selectors";

type InventoryItemSection = "materials" | "consumables" | "currencies";

function getInventorySection(itemId: string): InventoryItemSection | null {
  const item = ITEMS.find((definition) => definition.id === itemId);

  if (item === undefined) {
    return null;
  }

  switch (item.type) {
    case "material":
      return "materials";
    case "consumable":
      return "consumables";
    case "currency":
      return "currencies";
  }
}

function addToStacks(stacks: ItemStack[], item: ItemStack): ItemStack[] {
  const existingStack = stacks.find((stack) => stack.itemId === item.itemId);

  if (existingStack === undefined) {
    return [...stacks, { ...item }];
  }

  return stacks.map((stack) =>
    stack.itemId === item.itemId ? { ...stack, quantity: stack.quantity + item.quantity } : stack
  );
}

export function addItemStacks(
  save: GameSaveData,
  items: Array<{ itemId: string; quantity: number }>
): GameSaveData {
  let materials = save.inventory.materials;
  let consumables = save.inventory.consumables;
  let currencies = save.inventory.currencies;

  for (const item of items) {
    if (item.quantity <= 0) {
      continue;
    }

    const section = getInventorySection(item.itemId);

    if (section === "materials") {
      materials = addToStacks(materials, item);
    }

    if (section === "consumables") {
      consumables = addToStacks(consumables, item);
    }

    if (section === "currencies") {
      currencies = addToStacks(currencies, item);
    }
  }

  return {
    ...save,
    inventory: {
      ...save.inventory,
      materials,
      consumables,
      currencies
    }
  };
}

export function addEquipments(
  save: GameSaveData,
  equipments: EquipmentInstance[]
): GameSaveData {
  const availableSlots = Math.max(0, save.inventory.maxEquipmentCount - save.inventory.equipments.length);
  const acceptedEquipments = equipments.slice(0, availableSlots);

  return {
    ...save,
    inventory: {
      ...save.inventory,
      equipments: [...save.inventory.equipments, ...acceptedEquipments]
    }
  };
}

export function addItem(
  inventory: InventoryState,
  itemId: string,
  quantity: number
): InventoryState {
  const section = getInventorySection(itemId);

  if (section === null) {
    return inventory;
  }

  const item: ItemStack = { itemId, quantity };

  return {
    ...inventory,
    [section]: addToStacks(inventory[section], item)
  };
}

export function removeItem(
  save: GameSaveData,
  itemId: string,
  quantity: number
): GameSaveData {
  const section = getInventorySection(itemId);

  if (section === null) {
    return save;
  }

  const stacks = save.inventory[section].map((stack) => {
    if (stack.itemId !== itemId) {
      return stack;
    }

    return {
      ...stack,
      quantity: Math.max(0, stack.quantity - quantity)
    };
  }).filter((stack) => stack.quantity > 0);

  return {
    ...save,
    inventory: {
      ...save.inventory,
      [section]: stacks
    }
  };
}

export function applyLootToSave(save: GameSaveData, loot: LootResult, now = Date.now()): GameSaveData {
  const saveWithItems = addItemStacks(save, loot.items);
  const saveWithEquipments = addEquipments(saveWithItems, loot.equipments);
  const finalStats = calculateFinalStats(saveWithEquipments);
  const spiritStoneGain = Math.floor(loot.spiritStones * (1 + finalStats.spiritStoneBonus));

  return {
    ...saveWithEquipments,
    player: {
      ...saveWithEquipments.player,
      spiritStones: saveWithEquipments.player.spiritStones + spiritStoneGain,
      cultivation: {
        ...saveWithEquipments.player.cultivation,
        currentCultivation:
          saveWithEquipments.player.cultivation.currentCultivation + loot.cultivation,
        totalCultivation: saveWithEquipments.player.cultivation.totalCultivation + loot.cultivation
      }
    },
    runtime: {
      ...saveWithEquipments.runtime,
      time: {
        ...saveWithEquipments.runtime.time,
        updatedAt: now
      }
    }
  };
}

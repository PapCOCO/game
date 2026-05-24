import type { EquipmentInstance, GameSaveData, ItemStack } from "../types";
import type { LootResult } from "./loot";
import { ITEMS } from "../config";

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

export function applyLootToSave(save: GameSaveData, loot: LootResult, now = Date.now()): GameSaveData {
  const saveWithItems = addItemStacks(save, loot.items);
  const saveWithEquipments = addEquipments(saveWithItems, loot.equipments);

  return {
    ...saveWithEquipments,
    player: {
      ...saveWithEquipments.player,
      spiritStones: saveWithEquipments.player.spiritStones + loot.spiritStones,
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

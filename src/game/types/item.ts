import type { ID, Rarity } from "./common";
import type { EquipmentInstance } from "./equipment";

export type ItemType = "material" | "consumable" | "currency";

export interface ItemDefinition {
  id: ID;
  name: string;
  description: string;
  type: ItemType;
  rarity: Rarity;
  stackable: true;
  maxStack: number;
}

export interface ItemStack {
  itemId: ID;
  quantity: number;
}

export interface InventoryState {
  materials: ItemStack[];
  consumables: ItemStack[];
  currencies: ItemStack[];
  equipments: EquipmentInstance[];
  maxEquipmentCount: number;
}

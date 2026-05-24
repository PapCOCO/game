import type { ID, Rarity } from "./common";
import type { CoreStats, StatModifier } from "./stats";

export type EquipmentSlot = "weapon" | "armor" | "amulet" | "ring";

export interface EquipmentAffixDefinition {
  id: ID;
  name: string;
  description: string;
  modifiers: StatModifier[];
  rarity: Rarity;
}

export interface EquipmentAffixInstance {
  affixId: ID;
  name: string;
  modifiers: StatModifier[];
}

export interface EquipmentDefinition {
  id: ID;
  name: string;
  description: string;
  slot: EquipmentSlot;
  rarity: Rarity;
  baseStats: Partial<CoreStats>;
  minLevel: number;
  possibleAffixIds: ID[];
}

export interface EquipmentInstance {
  instanceId: ID;
  equipmentId: ID;
  name: string;
  slot: EquipmentSlot;
  rarity: Rarity;
  baseStats: Partial<CoreStats>;
  affixes: EquipmentAffixInstance[];
  level: number;
  locked: boolean;
  createdAt: number;
}

export type EquippedItems = Partial<Record<EquipmentSlot, ID>>;

import type { ID, Rarity } from "./common";

export interface PillRecipe {
  id: ID;
  name: string;
  description: string;
  outputItemId: ID;
  materials: Array<{ itemId: ID; quantity: number }>;
  spiritStoneCost: number;
  baseSuccessRate: number;
  requiredAlchemyLevel: number;
}

export interface AlchemyState {
  level: number;
  exp: number;
  totalAttempts: number;
  totalSuccesses: number;
}

export interface MarketItemDefinition {
  id: ID;
  itemId: ID;
  name: string;
  price: number;
  quantity: number;
  rarity: Rarity;
  category: "material" | "consumable" | "equipment";
}

export interface MarketItem {
  definitionId: ID;
  itemId: ID;
  name: string;
  price: number;
  quantity: number;
  rarity: Rarity;
  category: "material" | "consumable" | "equipment";
}

export interface MarketState {
  items: MarketItem[];
  lastRefreshedAt: number;
}

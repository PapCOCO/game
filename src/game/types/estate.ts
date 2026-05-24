import type { ID } from "./common";

export interface EstateFacilityDefinition {
  id: ID;
  name: string;
  description: string;
  maxLevel: number;
  upgradeCosts: Array<{ spiritStones: number; materials: Array<{ itemId: ID; quantity: number }> }>;
}

export interface EstateFacilityState {
  definitionId: ID;
  level: number;
  unlocked: boolean;
}

export interface SpiritFieldState extends EstateFacilityState {
  plantedAt: number | null;
  cropItemId: ID | null;
  cropQuantity: number;
  harvestReadyAt: number | null;
}

export interface SpiritVeinState extends EstateFacilityState {
  accumulatedCultivation: number;
  lastCollectedAt: number;
}

export interface GatheringArrayState extends EstateFacilityState {
  cultivationBonusPercent: number;
}

export interface EstateState {
  level: number;
  exp: number;
  spiritFields: SpiritFieldState[];
  spiritVein: SpiritVeinState;
  gatheringArray: GatheringArrayState;
}

export interface EstateUpgradeResult {
  save: import("./save").GameSaveData;
  success: boolean;
  message: string;
}

export interface EstateHarvestResult {
  save: import("./save").GameSaveData;
  success: boolean;
  message: string;
  harvestedItems: Array<{ itemId: ID; quantity: number }>;
}

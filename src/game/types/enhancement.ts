import type { GameSaveData } from "./save";

export interface EnhancementConfig {
  level: number;
  successRate: number;
  attributeMultiplier: number;
  materials: Array<{
    itemId: string;
    quantity: number;
  }>;
  spiritStoneCost: number;
}

export interface EnhancementResult {
  save: GameSaveData;
  success: boolean;
  newLevel: number;
  message: string;
}

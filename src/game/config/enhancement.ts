import type { EnhancementConfig } from "../types";
import { ITEM_IDS } from "./items";

export const MAX_ENHANCEMENT_LEVEL = 12;

export const ENHANCEMENT_CONFIG: EnhancementConfig[] = [
  {
    level: 1,
    successRate: 0.9,
    attributeMultiplier: 1.1,
    materials: [{ itemId: ITEM_IDS.IRON_ORE, quantity: 1 }],
    spiritStoneCost: 20
  },
  {
    level: 2,
    successRate: 0.85,
    attributeMultiplier: 1.2,
    materials: [{ itemId: ITEM_IDS.IRON_ORE, quantity: 2 }],
    spiritStoneCost: 40
  },
  {
    level: 3,
    successRate: 0.8,
    attributeMultiplier: 1.3,
    materials: [
      { itemId: ITEM_IDS.IRON_ORE, quantity: 2 },
      { itemId: ITEM_IDS.WOLF_FANG, quantity: 1 }
    ],
    spiritStoneCost: 80
  },
  {
    level: 4,
    successRate: 0.75,
    attributeMultiplier: 1.4,
    materials: [
      { itemId: ITEM_IDS.IRON_ORE, quantity: 3 },
      { itemId: ITEM_IDS.WOLF_FANG, quantity: 2 }
    ],
    spiritStoneCost: 150
  },
  {
    level: 5,
    successRate: 0.7,
    attributeMultiplier: 1.5,
    materials: [
      { itemId: ITEM_IDS.IRON_ORE, quantity: 3 },
      { itemId: ITEM_IDS.WOLF_FANG, quantity: 2 },
      { itemId: ITEM_IDS.SERPENT_GALL, quantity: 1 }
    ],
    spiritStoneCost: 300
  },
  {
    level: 6,
    successRate: 0.65,
    attributeMultiplier: 1.6,
    materials: [
      { itemId: ITEM_IDS.WOLF_FANG, quantity: 3 },
      { itemId: ITEM_IDS.SERPENT_GALL, quantity: 2 }
    ],
    spiritStoneCost: 500
  },
  {
    level: 7,
    successRate: 0.6,
    attributeMultiplier: 1.7,
    materials: [
      { itemId: ITEM_IDS.WOLF_FANG, quantity: 3 },
      { itemId: ITEM_IDS.SERPENT_GALL, quantity: 2 },
      { itemId: ITEM_IDS.CRACKED_JADE, quantity: 1 }
    ],
    spiritStoneCost: 800
  },
  {
    level: 8,
    successRate: 0.55,
    attributeMultiplier: 1.8,
    materials: [
      { itemId: ITEM_IDS.SERPENT_GALL, quantity: 3 },
      { itemId: ITEM_IDS.CRACKED_JADE, quantity: 2 }
    ],
    spiritStoneCost: 1200
  },
  {
    level: 9,
    successRate: 0.5,
    attributeMultiplier: 1.9,
    materials: [
      { itemId: ITEM_IDS.SERPENT_GALL, quantity: 4 },
      { itemId: ITEM_IDS.CRACKED_JADE, quantity: 3 }
    ],
    spiritStoneCost: 1800
  },
  {
    level: 10,
    successRate: 0.45,
    attributeMultiplier: 2.0,
    materials: [
      { itemId: ITEM_IDS.CRACKED_JADE, quantity: 4 }
    ],
    spiritStoneCost: 2500
  },
  {
    level: 11,
    successRate: 0.35,
    attributeMultiplier: 2.2,
    materials: [
      { itemId: ITEM_IDS.CRACKED_JADE, quantity: 6 }
    ],
    spiritStoneCost: 4000
  },
  {
    level: 12,
    successRate: 0.25,
    attributeMultiplier: 2.5,
    materials: [
      { itemId: ITEM_IDS.CRACKED_JADE, quantity: 8 }
    ],
    spiritStoneCost: 6000
  }
];

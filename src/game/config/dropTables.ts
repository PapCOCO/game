import type { MonsterDropTable } from "../types";
import { EQUIPMENT_TEMPLATE_IDS } from "./equipmentTemplates";
import { ITEM_IDS } from "./items";

export const DROP_TABLE_IDS = {
  QINGSHI_SMALL_BEAST: "drop.qingshi_small_beast",
  QINGSHI_HERB_GUARD: "drop.qingshi_herb_guard",
  QINGSHI_DEEP_BEAST: "drop.qingshi_deep_beast",
  BLACKWIND_SCOUT: "drop.blackwind_scout",
  BLACKWIND_ELITE: "drop.blackwind_elite",
  MINE_BEAST: "drop.mine_beast",
  MINE_SPIRIT: "drop.mine_spirit",
  MIST_INSECT: "drop.mist_insect",
  MIST_SPIRIT: "drop.mist_spirit"
} as const;

export type DropTableId = (typeof DROP_TABLE_IDS)[keyof typeof DROP_TABLE_IDS];

export const DROP_TABLES: Record<DropTableId, MonsterDropTable> = {
  [DROP_TABLE_IDS.QINGSHI_SMALL_BEAST]: {
    spiritStones: { min: 1, max: 4 },
    cultivation: { min: 4, max: 10 },
    items: [
      { itemId: ITEM_IDS.WOLF_FANG, quantity: { min: 1, max: 2 }, dropRate: 0.42 },
      { itemId: ITEM_IDS.TOUGH_HIDE, quantity: { min: 1, max: 2 }, dropRate: 0.36 },
      { itemId: ITEM_IDS.SPIRIT_GRASS, quantity: { min: 1, max: 1 }, dropRate: 0.18 }
    ],
    equipments: [
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.IRON_SWORD, dropRate: 0.025 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.CLOTH_ROBE, dropRate: 0.03 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.COPPER_RING, dropRate: 0.015 }
    ]
  },
  [DROP_TABLE_IDS.QINGSHI_HERB_GUARD]: {
    spiritStones: { min: 2, max: 7 },
    cultivation: { min: 8, max: 18 },
    items: [
      { itemId: ITEM_IDS.SPIRIT_GRASS, quantity: { min: 1, max: 3 }, dropRate: 0.5 },
      { itemId: ITEM_IDS.SERPENT_GALL, quantity: { min: 1, max: 1 }, dropRate: 0.28 },
      { itemId: ITEM_IDS.QI_GATHERING_PILL, quantity: { min: 1, max: 1 }, dropRate: 0.06 }
    ],
    equipments: [
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.WOODEN_AMULET, dropRate: 0.025 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.SPIRIT_GATHERING_RING, dropRate: 0.012 }
    ]
  },
  [DROP_TABLE_IDS.QINGSHI_DEEP_BEAST]: {
    spiritStones: { min: 5, max: 14 },
    cultivation: { min: 18, max: 38 },
    items: [
      { itemId: ITEM_IDS.BEAR_BONE, quantity: { min: 1, max: 2 }, dropRate: 0.34 },
      { itemId: ITEM_IDS.TOUGH_HIDE, quantity: { min: 1, max: 3 }, dropRate: 0.32 },
      { itemId: ITEM_IDS.LOW_SPIRIT_CORE, quantity: { min: 1, max: 1 }, dropRate: 0.04 }
    ],
    equipments: [
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.QINGSHI_BLADE, dropRate: 0.025 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.HIDE_ARMOR, dropRate: 0.03 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.JADE_AMULET, dropRate: 0.018 }
    ]
  },
  [DROP_TABLE_IDS.BLACKWIND_SCOUT]: {
    spiritStones: { min: 8, max: 20 },
    cultivation: { min: 28, max: 55 },
    items: [
      { itemId: ITEM_IDS.SHADOW_FEATHER, quantity: { min: 1, max: 2 }, dropRate: 0.36 },
      { itemId: ITEM_IDS.BLACKWIND_TOKEN, quantity: { min: 1, max: 1 }, dropRate: 0.22 },
      { itemId: ITEM_IDS.SPIRIT_STONE_SHARD, quantity: { min: 1, max: 4 }, dropRate: 0.25 }
    ],
    equipments: [
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.BLACKWIND_SABER, dropRate: 0.02 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.BLACKWIND_RING, dropRate: 0.012 }
    ]
  },
  [DROP_TABLE_IDS.BLACKWIND_ELITE]: {
    spiritStones: { min: 12, max: 32 },
    cultivation: { min: 42, max: 86 },
    items: [
      { itemId: ITEM_IDS.BLACKWIND_TOKEN, quantity: { min: 1, max: 2 }, dropRate: 0.38 },
      { itemId: ITEM_IDS.THORN_VINE, quantity: { min: 1, max: 2 }, dropRate: 0.3 },
      { itemId: ITEM_IDS.LOW_SPIRIT_CORE, quantity: { min: 1, max: 1 }, dropRate: 0.06 }
    ],
    equipments: [
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.BLACKWIND_SABER, dropRate: 0.032 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.BLACKWIND_RING, dropRate: 0.02 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.MINER_SCALE_ARMOR, dropRate: 0.012 }
    ]
  },
  [DROP_TABLE_IDS.MINE_BEAST]: {
    spiritStones: { min: 10, max: 26 },
    cultivation: { min: 32, max: 70 },
    items: [
      { itemId: ITEM_IDS.IRON_ORE, quantity: { min: 2, max: 5 }, dropRate: 0.55 },
      { itemId: ITEM_IDS.CRACKED_JADE, quantity: { min: 1, max: 2 }, dropRate: 0.22 },
      { itemId: ITEM_IDS.LOW_SPIRIT_CORE, quantity: { min: 1, max: 1 }, dropRate: 0.04 }
    ],
    equipments: [
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.QINGSHI_BLADE, dropRate: 0.02 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.MINER_SCALE_ARMOR, dropRate: 0.025 }
    ]
  },
  [DROP_TABLE_IDS.MINE_SPIRIT]: {
    spiritStones: { min: 15, max: 42 },
    cultivation: { min: 55, max: 110 },
    items: [
      { itemId: ITEM_IDS.GHOST_DUST, quantity: { min: 1, max: 3 }, dropRate: 0.42 },
      { itemId: ITEM_IDS.CRACKED_JADE, quantity: { min: 1, max: 3 }, dropRate: 0.32 },
      { itemId: ITEM_IDS.LOW_SPIRIT_CORE, quantity: { min: 1, max: 1 }, dropRate: 0.08 }
    ],
    equipments: [
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.MINER_SCALE_ARMOR, dropRate: 0.03 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.MIST_AMULET, dropRate: 0.014 }
    ]
  },
  [DROP_TABLE_IDS.MIST_INSECT]: {
    spiritStones: { min: 18, max: 48 },
    cultivation: { min: 62, max: 130 },
    items: [
      { itemId: ITEM_IDS.MIST_SILK, quantity: { min: 1, max: 3 }, dropRate: 0.46 },
      { itemId: ITEM_IDS.SPIRIT_GRASS, quantity: { min: 2, max: 4 }, dropRate: 0.28 },
      { itemId: ITEM_IDS.LOW_SPIRIT_CORE, quantity: { min: 1, max: 1 }, dropRate: 0.1 }
    ],
    equipments: [
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.MISTLIGHT_SWORD, dropRate: 0.018 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.CLOUD_PATTERN_ROBE, dropRate: 0.018 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.MIST_AMULET, dropRate: 0.025 }
    ]
  },
  [DROP_TABLE_IDS.MIST_SPIRIT]: {
    spiritStones: { min: 28, max: 75 },
    cultivation: { min: 95, max: 210 },
    items: [
      { itemId: ITEM_IDS.MIST_SILK, quantity: { min: 2, max: 4 }, dropRate: 0.38 },
      { itemId: ITEM_IDS.GHOST_DUST, quantity: { min: 1, max: 3 }, dropRate: 0.3 },
      { itemId: ITEM_IDS.LOW_SPIRIT_CORE, quantity: { min: 1, max: 2 }, dropRate: 0.14 }
    ],
    equipments: [
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.MISTLIGHT_SWORD, dropRate: 0.03 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.CLOUD_PATTERN_ROBE, dropRate: 0.026 },
      { equipmentId: EQUIPMENT_TEMPLATE_IDS.FOUNDATION_SEED_RING, dropRate: 0.006 }
    ]
  }
};

export const ESTATE_CONFIG = {
  maxEstateLevel: 5,
  estateLevelRequirements: [0, 100, 300, 600, 1000],
  estateExpPerUpgrade: 20,

  spiritField: {
    maxLevel: 5,
    baseHarvestTimeMs: 5 * 60 * 1000,
    harvestTimeReductionPerLevel: 0.15,
    baseCropQuantity: 2,
    quantityBonusPerLevel: 1,
    crops: [
      { itemId: "item.spirit_grass", name: "凝气草", levelRequired: 1 },
      { itemId: "item.iron_ore", name: "赤纹铁矿", levelRequired: 2 },
      { itemId: "item.wolf_fang", name: "灰狼牙", levelRequired: 3 },
      { itemId: "item.serpent_gall", name: "青蛇胆", levelRequired: 4 },
      { itemId: "item.cracked_jade", name: "裂纹灵玉", levelRequired: 5 }
    ],
    upgradeCosts: [
      { spiritStones: 20, materials: [] },
      { spiritStones: 50, materials: [{ itemId: "item.spirit_grass", quantity: 5 }] },
      { spiritStones: 120, materials: [{ itemId: "item.iron_ore", quantity: 5 }] },
      { spiritStones: 250, materials: [{ itemId: "item.serpent_gall", quantity: 3 }] },
      { spiritStones: 500, materials: [{ itemId: "item.cracked_jade", quantity: 3 }] }
    ]
  },

  spiritVein: {
    maxLevel: 5,
    baseCultivationPerMinute: 3,
    cultivationBonusPerLevel: 2,
    maxAccumulatedCultivation: 500,
    upgradeCosts: [
      { spiritStones: 30, materials: [] },
      { spiritStones: 80, materials: [{ itemId: "item.spirit_grass", quantity: 8 }] },
      { spiritStones: 180, materials: [{ itemId: "item.wolf_fang", quantity: 5 }] },
      { spiritStones: 350, materials: [{ itemId: "item.bear_bone", quantity: 3 }] },
      { spiritStones: 600, materials: [{ itemId: "item.shadow_feather", quantity: 3 }] }
    ]
  },

  gatheringArray: {
    maxLevel: 5,
    baseBonusPercent: 5,
    bonusPerLevel: 5,
    upgradeCosts: [
      { spiritStones: 40, materials: [] },
      { spiritStones: 100, materials: [{ itemId: "item.iron_ore", quantity: 5 }] },
      { spiritStones: 220, materials: [{ itemId: "item.serpent_gall", quantity: 4 }] },
      { spiritStones: 400, materials: [{ itemId: "item.cracked_jade", quantity: 3 }] },
      { spiritStones: 700, materials: [{ itemId: "item.ghost_dust", quantity: 2 }] }
    ]
  },

  pillFurnace: {
    maxLevel: 5,
    qualities: [
      {
        id: "furnace.clay",
        name: "陶土丹炉",
        successBonus: 0,
        costReductionPercent: 0,
        extraYieldChance: 0,
        expBonusPercent: 0
      },
      {
        id: "furnace.bronze",
        name: "青铜丹炉",
        successBonus: 0.04,
        costReductionPercent: 5,
        extraYieldChance: 0,
        expBonusPercent: 5
      },
      {
        id: "furnace.mystic_iron",
        name: "玄铁丹炉",
        successBonus: 0.08,
        costReductionPercent: 8,
        extraYieldChance: 0.08,
        expBonusPercent: 10
      },
      {
        id: "furnace.earthfire",
        name: "地火丹炉",
        successBonus: 0.12,
        costReductionPercent: 12,
        extraYieldChance: 0.16,
        expBonusPercent: 15
      },
      {
        id: "furnace.celestial",
        name: "星纹丹炉",
        successBonus: 0.16,
        costReductionPercent: 15,
        extraYieldChance: 0.25,
        expBonusPercent: 25
      }
    ],
    upgradeCosts: [
      { spiritStones: 0, materials: [] },
      { spiritStones: 80, materials: [{ itemId: "item.iron_ore", quantity: 4 }] },
      { spiritStones: 180, materials: [{ itemId: "item.cracked_jade", quantity: 3 }] },
      { spiritStones: 360, materials: [{ itemId: "item.ghost_dust", quantity: 2 }] },
      { spiritStones: 680, materials: [{ itemId: "item.low_spirit_core", quantity: 2 }] }
    ]
  }
} as const;

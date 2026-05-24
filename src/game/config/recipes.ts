import type { PillRecipe } from "../types";

export const RECIPE_IDS = {
  HEALING_PILL: "recipe.healing_pill",
  QI_GATHERING_PILL: "recipe.qi_gathering_pill",
  SPIRIT_STONE_PILL: "recipe.spirit_stone_pill",
  BEAST_BLOOD_PILL: "recipe.beast_blood_pill"
} as const;

export const RECIPES: PillRecipe[] = [
  {
    id: RECIPE_IDS.HEALING_PILL,
    name: "回春丸",
    description: "行走山野时常备的疗伤小药。",
    outputItemId: "item.healing_pill",
    materials: [
      { itemId: "item.spirit_grass", quantity: 2 },
      { itemId: "item.wolf_fang", quantity: 1 }
    ],
    spiritStoneCost: 5,
    baseSuccessRate: 0.95,
    requiredAlchemyLevel: 1
  },
  {
    id: RECIPE_IDS.QI_GATHERING_PILL,
    name: "聚气散",
    description: "辅助炼气期修士吐纳灵气的基础丹药。",
    outputItemId: "item.qi_gathering_pill",
    materials: [
      { itemId: "item.spirit_grass", quantity: 3 },
      { itemId: "item.serpent_gall", quantity: 1 },
      { itemId: "item.cracked_jade", quantity: 1 }
    ],
    spiritStoneCost: 15,
    baseSuccessRate: 0.85,
    requiredAlchemyLevel: 2
  },
  {
    id: RECIPE_IDS.SPIRIT_STONE_PILL,
    name: "凝灵丹",
    description: "凝聚灵气为实质，服用后可获得大量修为。",
    outputItemId: "item.qi_gathering_pill",
    materials: [
      { itemId: "item.low_spirit_core", quantity: 1 },
      { itemId: "item.ghost_dust", quantity: 2 },
      { itemId: "item.mist_silk", quantity: 1 }
    ],
    spiritStoneCost: 50,
    baseSuccessRate: 0.7,
    requiredAlchemyLevel: 4
  },
  {
    id: RECIPE_IDS.BEAST_BLOOD_PILL,
    name: "兽血丹",
    description: "以妖兽精血炼制，可临时提升战斗能力。",
    outputItemId: "item.healing_pill",
    materials: [
      { itemId: "item.bear_bone", quantity: 2 },
      { itemId: "item.thorn_vine", quantity: 1 },
      { itemId: "item.shadow_feather", quantity: 1 }
    ],
    spiritStoneCost: 30,
    baseSuccessRate: 0.75,
    requiredAlchemyLevel: 3
  }
];

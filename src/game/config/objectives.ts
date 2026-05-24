import type { ObjectiveDefinition } from "../types";
import { ITEM_IDS } from "./items";

export const OBJECTIVES: ObjectiveDefinition[] = [
  {
    id: "objective.defeat_5",
    title: "初入青石山",
    description: "在当前历练中击败 5 只怪物。",
    type: "defeat",
    target: 5,
    reward: {
      spiritStones: 20,
      items: [{ itemId: ITEM_IDS.SPIRIT_GRASS, quantity: 3 }]
    }
  },
  {
    id: "objective.cultivation_100",
    title: "小有所成",
    description: "累计获得 100 点修为。",
    type: "cultivation",
    target: 100,
    reward: {
      spiritStones: 30
    }
  },
  {
    id: "objective.spirit_stones_50",
    title: "第一桶灵石",
    description: "身上拥有 50 枚灵石。",
    type: "collect",
    target: 50,
    reward: {
      cultivation: 40
    }
  },
  {
    id: "objective.equip_first",
    title: "兵刃初成",
    description: "穿戴任意一件装备。",
    type: "equip",
    target: 1,
    reward: {
      spiritStones: 25,
      items: [{ itemId: ITEM_IDS.IRON_ORE, quantity: 2 }]
    }
  },
  {
    id: "objective.enhance_1",
    title: "初试强化",
    description: "将任意装备强化到 +1。",
    type: "enhance",
    target: 1,
    reward: {
      spiritStones: 60
    }
  },
  {
    id: "objective.alchemy_1",
    title: "炼丹入门",
    description: "成功炼制 1 次丹药。",
    type: "alchemy",
    target: 1,
    reward: {
      spiritStones: 40,
      items: [{ itemId: ITEM_IDS.SPIRIT_GRASS, quantity: 5 }]
    }
  },
  {
    id: "objective.estate_plant_1",
    title: "灵田初种",
    description: "种植 1 次灵田。",
    type: "estate",
    target: 1,
    reward: {
      spiritStones: 35
    }
  },
  {
    id: "objective.breakthrough_1",
    title: "突破在望",
    description: "完成第一次突破。",
    type: "breakthrough",
    target: 1,
    reward: {
      spiritStones: 80,
      cultivation: 80
    }
  },
  {
    id: "objective.defeat_30",
    title: "山中历练",
    description: "累计击败 30 只怪物。",
    type: "defeat",
    target: 30,
    reward: {
      spiritStones: 120,
      items: [{ itemId: ITEM_IDS.IRON_ORE, quantity: 4 }]
    }
  },
  {
    id: "objective.enhance_3",
    title: "装备成形",
    description: "将任意装备强化到 +3。",
    type: "enhance",
    target: 3,
    reward: {
      spiritStones: 180,
      items: [{ itemId: ITEM_IDS.CRACKED_JADE, quantity: 1 }]
    }
  }
];

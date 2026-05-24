import type { ID } from "../types";
import { ITEM_IDS } from "./items";
import { MAP_IDS } from "./maps";
import { TECHNIQUE_IDS } from "./techniques";

export interface EncounterReward {
  cultivation?: number;
  spiritStones?: number;
  items?: Array<{ itemId: ID; quantity: number }>;
  techniqueFragments?: Array<{ techniqueId: ID; quantity: number }>;
}

export interface MapEncounterDefinition {
  id: ID;
  name: string;
  description: string;
  outcome: string;
  mapIds?: ID[];
  minMapOrder?: number;
  weight: number;
  reward: EncounterReward;
  hpDamagePercent?: number;
}

export const MAP_ENCOUNTER_COOLDOWN_MS = 5 * 60 * 1000;

export const MAP_ENCOUNTERS: MapEncounterDefinition[] = [
  {
    id: "encounter.hidden_spirit_spring",
    name: "山泉含灵",
    description: "你循着雾气找到一眼微热山泉，泉底有细碎灵光起伏。",
    outcome: "汲取山泉灵气，修为小有进境。",
    weight: 24,
    reward: {
      cultivation: 36,
      techniqueFragments: [{ techniqueId: TECHNIQUE_IDS.QINGSHI_BREATHING, quantity: 1 }]
    }
  },
  {
    id: "encounter.loose_stone_cache",
    name: "石缝旧囊",
    description: "崖壁石缝里卡着一只破旧储物囊，似是前人匆忙遗落。",
    outcome: "翻出少许灵石与可用材料。",
    weight: 20,
    reward: {
      spiritStones: 18,
      items: [{ itemId: ITEM_IDS.SPIRIT_GRASS, quantity: 2 }]
    }
  },
  {
    id: "encounter_herb_patch",
    name: "灵草小圃",
    description: "一处背阴坡地长着零星凝气草，根须仍带着湿润灵土。",
    outcome: "采得一把凝气草。",
    mapIds: [MAP_IDS.QINGSHI_OUTSKIRTS, MAP_IDS.QINGSHI_DEPTHS],
    weight: 22,
    reward: {
      items: [{ itemId: ITEM_IDS.SPIRIT_GRASS, quantity: 4 }]
    }
  },
  {
    id: "encounter_wounded_hunter",
    name: "负伤猎户",
    description: "你遇见一名被妖兽追赶的猎户，顺手替他逼退了山中野兽。",
    outcome: "猎户赠你几枚灵石作谢礼。",
    mapIds: [MAP_IDS.QINGSHI_OUTSKIRTS, MAP_IDS.QINGSHI_DEPTHS],
    weight: 16,
    reward: {
      spiritStones: 28
    },
    hpDamagePercent: 0.08
  },
  {
    id: "encounter_blackwind_remnant",
    name: "黑风残令",
    description: "林中枯树下露出半枚黑色令牌，周围还有未散尽的阴风。",
    outcome: "收得黑风令牌，但被阴风擦伤。",
    mapIds: [MAP_IDS.BLACKWIND_FOREST],
    weight: 18,
    reward: {
      spiritStones: 35,
      items: [{ itemId: ITEM_IDS.BLACKWIND_TOKEN, quantity: 1 }],
      techniqueFragments: [{ techniqueId: TECHNIQUE_IDS.WINDSTEP_MANUAL, quantity: 1 }]
    },
    hpDamagePercent: 0.12
  },
  {
    id: "encounter_ore_vein",
    name: "残矿暗脉",
    description: "矿洞岔路深处传来细碎回声，岩壁里尚嵌着赤纹铁矿。",
    outcome: "敲下一批赤纹铁矿。",
    mapIds: [MAP_IDS.ABANDONED_MINE],
    weight: 22,
    reward: {
      items: [{ itemId: ITEM_IDS.IRON_ORE, quantity: 5 }],
      techniqueFragments: [{ techniqueId: TECHNIQUE_IDS.IRON_BONE_FORMULA, quantity: 1 }]
    }
  },
  {
    id: "encounter_mist_illusion",
    name: "雾中幻象",
    description: "白雾里浮出若有若无的道影，一式吐纳法门转瞬即逝。",
    outcome: "你记下一缕玄妙气机，修为大涨。",
    mapIds: [MAP_IDS.MIST_VALLEY],
    weight: 20,
    reward: {
      cultivation: 120,
      items: [{ itemId: ITEM_IDS.MIST_SILK, quantity: 1 }],
      techniqueFragments: [{ techniqueId: TECHNIQUE_IDS.JADE_HEART_METHOD, quantity: 1 }]
    }
  },
  {
    id: "encounter_minor_ambush",
    name: "岔路惊袭",
    description: "你踏入岔路时忽觉背后一寒，暗处有低阶妖物扑来。",
    outcome: "虽将其击退，却也消耗了些气血。",
    minMapOrder: 2,
    weight: 12,
    reward: {
      spiritStones: 12,
      cultivation: 18
    },
    hpDamagePercent: 0.15
  }
];

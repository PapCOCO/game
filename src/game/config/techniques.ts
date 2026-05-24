import type { TechniqueDefinition } from "../types";

export const TECHNIQUE_IDS = {
  QINGSHI_BREATHING: "technique.qingshi_breathing",
  IRON_BONE_FORMULA: "technique.iron_bone_formula",
  WINDSTEP_MANUAL: "technique.windstep_manual",
  JADE_HEART_METHOD: "technique.jade_heart_method"
} as const;

export const TECHNIQUES: TechniqueDefinition[] = [
  {
    id: TECHNIQUE_IDS.QINGSHI_BREATHING,
    name: "青石吐纳诀",
    category: "mind",
    rarity: "common",
    description: "青石山散修常传的入门吐纳法，虽粗浅，却能稳住修炼根基。",
    requiredFragments: 3,
    modifiers: [
      { stat: "cultivationSpeed", type: "flat", value: 0.6 }
    ]
  },
  {
    id: TECHNIQUE_IDS.IRON_BONE_FORMULA,
    name: "铁骨诀",
    category: "body",
    rarity: "uncommon",
    description: "以矿洞煞气淬体的横练法门，可增气血与防御。",
    requiredFragments: 4,
    modifiers: [
      { stat: "maxHp", type: "flat", value: 38 },
      { stat: "defense", type: "flat", value: 4 }
    ]
  },
  {
    id: TECHNIQUE_IDS.WINDSTEP_MANUAL,
    name: "逐风步",
    category: "movement",
    rarity: "uncommon",
    description: "黑风林残卷所载身法，运转时脚下似有清风相随。",
    requiredFragments: 4,
    modifiers: [
      { stat: "speed", type: "flat", value: 5 },
      { stat: "spiritStoneBonus", type: "flat", value: 0.03 }
    ]
  },
  {
    id: TECHNIQUE_IDS.JADE_HEART_METHOD,
    name: "玉心凝神篇",
    category: "mind",
    rarity: "rare",
    description: "雾隐谷幻象中偶现的凝神法，能令灵气周转更绵长。",
    requiredFragments: 5,
    modifiers: [
      { stat: "cultivationSpeed", type: "percent", value: 0.08 },
      { stat: "attack", type: "flat", value: 6 }
    ]
  }
];

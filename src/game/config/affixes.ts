import type { EquipmentAffixDefinition } from "../types";

export const AFFIX_IDS = {
  SHARP: "affix.sharp",
  HEAVY: "affix.heavy",
  GUARDING: "affix.guarding",
  VITAL: "affix.vital",
  QUICKENING: "affix.quickening",
  PROSPEROUS: "affix.prosperous",
  PIERCING: "affix.piercing",
  STONE_SKIN: "affix.stone_skin",
  FLOWING_QI: "affix.flowing_qi",
  GOLDEN_LIGHT: "affix.golden_light",
  BLOOD_WARMING: "affix.blood_warming",
  DEEP_BREATH: "affix.deep_breath",
  MOUNTAIN_FORCE: "affix.mountain_force",
  CLOUD_STEP: "affix.cloud_step",
  SPIRIT_DRAW: "affix.spirit_draw"
} as const;

export const AFFIXES: EquipmentAffixDefinition[] = [
  {
    id: AFFIX_IDS.SHARP,
    name: "锋锐",
    description: "提升少量攻击。",
    rarity: "common",
    modifiers: [{ stat: "attack", type: "flat", value: 4 }]
  },
  {
    id: AFFIX_IDS.HEAVY,
    name: "沉稳",
    description: "提升少量防御。",
    rarity: "common",
    modifiers: [{ stat: "defense", type: "flat", value: 3 }]
  },
  {
    id: AFFIX_IDS.GUARDING,
    name: "护体",
    description: "增加少量气血上限。",
    rarity: "common",
    modifiers: [{ stat: "maxHp", type: "flat", value: 24 }]
  },
  {
    id: AFFIX_IDS.VITAL,
    name: "生机",
    description: "增加气血上限。",
    rarity: "uncommon",
    modifiers: [{ stat: "maxHp", type: "percent", value: 0.06 }]
  },
  {
    id: AFFIX_IDS.QUICKENING,
    name: "聚灵",
    description: "提升修炼速度。",
    rarity: "uncommon",
    modifiers: [{ stat: "cultivationSpeed", type: "percent", value: 0.05 }]
  },
  {
    id: AFFIX_IDS.PROSPEROUS,
    name: "招财",
    description: "提升灵石收益。",
    rarity: "uncommon",
    modifiers: [{ stat: "spiritStoneBonus", type: "flat", value: 0.04 }]
  },
  {
    id: AFFIX_IDS.PIERCING,
    name: "破甲",
    description: "显著提升攻击。",
    rarity: "rare",
    modifiers: [{ stat: "attack", type: "percent", value: 0.08 }]
  },
  {
    id: AFFIX_IDS.STONE_SKIN,
    name: "石肤",
    description: "显著提升防御。",
    rarity: "rare",
    modifiers: [{ stat: "defense", type: "percent", value: 0.08 }]
  },
  {
    id: AFFIX_IDS.FLOWING_QI,
    name: "行气",
    description: "提升攻击与修炼速度。",
    rarity: "rare",
    modifiers: [
      { stat: "attack", type: "flat", value: 8 },
      { stat: "cultivationSpeed", type: "percent", value: 0.06 }
    ]
  },
  {
    id: AFFIX_IDS.GOLDEN_LIGHT,
    name: "金光",
    description: "提升防御与灵石收益。",
    rarity: "rare",
    modifiers: [
      { stat: "defense", type: "flat", value: 8 },
      { stat: "spiritStoneBonus", type: "flat", value: 0.05 }
    ]
  },
  {
    id: AFFIX_IDS.BLOOD_WARMING,
    name: "温血",
    description: "大幅增加气血。",
    rarity: "epic",
    modifiers: [
      { stat: "maxHp", type: "flat", value: 80 },
      { stat: "maxHp", type: "percent", value: 0.06 }
    ]
  },
  {
    id: AFFIX_IDS.DEEP_BREATH,
    name: "长息",
    description: "大幅提升修炼速度。",
    rarity: "epic",
    modifiers: [{ stat: "cultivationSpeed", type: "percent", value: 0.12 }]
  },
  {
    id: AFFIX_IDS.MOUNTAIN_FORCE,
    name: "山势",
    description: "大幅提升攻击与防御。",
    rarity: "epic",
    modifiers: [
      { stat: "attack", type: "percent", value: 0.1 },
      { stat: "defense", type: "percent", value: 0.1 }
    ]
  },
  {
    id: AFFIX_IDS.CLOUD_STEP,
    name: "云行",
    description: "提升修炼速度与灵石收益。",
    rarity: "legendary",
    modifiers: [
      { stat: "cultivationSpeed", type: "percent", value: 0.16 },
      { stat: "spiritStoneBonus", type: "flat", value: 0.1 }
    ]
  },
  {
    id: AFFIX_IDS.SPIRIT_DRAW,
    name: "引灵",
    description: "全面提升修炼收益。",
    rarity: "legendary",
    modifiers: [
      { stat: "cultivationSpeed", type: "percent", value: 0.2 },
      { stat: "spiritStoneBonus", type: "flat", value: 0.14 }
    ]
  }
];

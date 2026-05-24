import type { EquipmentDefinition } from "../types";
import { AFFIX_IDS } from "./affixes";

export const EQUIPMENT_TEMPLATE_IDS = {
  IRON_SWORD: "equipment.iron_sword",
  QINGSHI_BLADE: "equipment.qingshi_blade",
  BLACKWIND_SABER: "equipment.blackwind_saber",
  MISTLIGHT_SWORD: "equipment.mistlight_sword",
  CLOTH_ROBE: "equipment.cloth_robe",
  HIDE_ARMOR: "equipment.hide_armor",
  MINER_SCALE_ARMOR: "equipment.miner_scale_armor",
  CLOUD_PATTERN_ROBE: "equipment.cloud_pattern_robe",
  WOODEN_AMULET: "equipment.wooden_amulet",
  JADE_AMULET: "equipment.jade_amulet",
  MIST_AMULET: "equipment.mist_amulet",
  COPPER_RING: "equipment.copper_ring",
  SPIRIT_GATHERING_RING: "equipment.spirit_gathering_ring",
  BLACKWIND_RING: "equipment.blackwind_ring",
  FOUNDATION_SEED_RING: "equipment.foundation_seed_ring"
} as const;

export const EQUIPMENT_TEMPLATES: EquipmentDefinition[] = [
  {
    id: EQUIPMENT_TEMPLATE_IDS.IRON_SWORD,
    name: "镔铁剑",
    description: "入门修士常用的铁剑，胜在可靠。",
    slot: "weapon",
    rarity: "common",
    baseStats: { attack: 10 },
    minLevel: 1,
    possibleAffixIds: [AFFIX_IDS.SHARP, AFFIX_IDS.FLOWING_QI]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.QINGSHI_BLADE,
    name: "青石刃",
    description: "以青石山矿铁炼成，刃口带有淡淡灵光。",
    slot: "weapon",
    rarity: "uncommon",
    baseStats: { attack: 18, cultivationSpeed: 0.08 },
    minLevel: 3,
    possibleAffixIds: [AFFIX_IDS.SHARP, AFFIX_IDS.PIERCING, AFFIX_IDS.FLOWING_QI]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.BLACKWIND_SABER,
    name: "黑风刀",
    description: "黑风林散修惯用的厚背刀，攻势凶狠。",
    slot: "weapon",
    rarity: "rare",
    baseStats: { attack: 32 },
    minLevel: 6,
    possibleAffixIds: [AFFIX_IDS.PIERCING, AFFIX_IDS.MOUNTAIN_FORCE, AFFIX_IDS.FLOWING_QI]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.MISTLIGHT_SWORD,
    name: "雾光剑",
    description: "剑身若雾，适合炼气后期修士温养。",
    slot: "weapon",
    rarity: "epic",
    baseStats: { attack: 48, cultivationSpeed: 0.18 },
    minLevel: 8,
    possibleAffixIds: [AFFIX_IDS.PIERCING, AFFIX_IDS.DEEP_BREATH, AFFIX_IDS.SPIRIT_DRAW]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.CLOTH_ROBE,
    name: "粗布法衣",
    description: "简单缝制的法衣，可抵御轻微灵力冲击。",
    slot: "armor",
    rarity: "common",
    baseStats: { defense: 6, maxHp: 30 },
    minLevel: 1,
    possibleAffixIds: [AFFIX_IDS.HEAVY, AFFIX_IDS.GUARDING]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.HIDE_ARMOR,
    name: "兽皮护甲",
    description: "以坚韧兽皮制成，适合山野历练。",
    slot: "armor",
    rarity: "uncommon",
    baseStats: { defense: 13, maxHp: 55 },
    minLevel: 3,
    possibleAffixIds: [AFFIX_IDS.HEAVY, AFFIX_IDS.VITAL, AFFIX_IDS.STONE_SKIN]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.MINER_SCALE_ARMOR,
    name: "矿鳞甲",
    description: "嵌有赤纹铁片的轻甲，沉稳扎实。",
    slot: "armor",
    rarity: "rare",
    baseStats: { defense: 24, maxHp: 105 },
    minLevel: 6,
    possibleAffixIds: [AFFIX_IDS.STONE_SKIN, AFFIX_IDS.BLOOD_WARMING, AFFIX_IDS.GOLDEN_LIGHT]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.CLOUD_PATTERN_ROBE,
    name: "云纹法衣",
    description: "雾隐谷遗落的法衣，纹路可缓慢聚灵。",
    slot: "armor",
    rarity: "epic",
    baseStats: { defense: 36, maxHp: 160, cultivationSpeed: 0.16 },
    minLevel: 8,
    possibleAffixIds: [AFFIX_IDS.BLOOD_WARMING, AFFIX_IDS.DEEP_BREATH, AFFIX_IDS.CLOUD_STEP]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.WOODEN_AMULET,
    name: "桃木护符",
    description: "刻有简陋符纹的桃木牌。",
    slot: "amulet",
    rarity: "common",
    baseStats: { maxHp: 24, defense: 2 },
    minLevel: 1,
    possibleAffixIds: [AFFIX_IDS.GUARDING, AFFIX_IDS.QUICKENING]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.JADE_AMULET,
    name: "碎玉护符",
    description: "以裂纹灵玉打磨出的护符，能略微凝神。",
    slot: "amulet",
    rarity: "uncommon",
    baseStats: { maxHp: 45, cultivationSpeed: 0.08 },
    minLevel: 4,
    possibleAffixIds: [AFFIX_IDS.VITAL, AFFIX_IDS.QUICKENING, AFFIX_IDS.GOLDEN_LIGHT]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.MIST_AMULET,
    name: "雾隐护符",
    description: "雾气缠绕的护符，佩戴时心神清明。",
    slot: "amulet",
    rarity: "rare",
    baseStats: { maxHp: 85, cultivationSpeed: 0.15 },
    minLevel: 7,
    possibleAffixIds: [AFFIX_IDS.DEEP_BREATH, AFFIX_IDS.CLOUD_STEP, AFFIX_IDS.SPIRIT_DRAW]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.COPPER_RING,
    name: "黄铜戒",
    description: "普通黄铜戒指，内侧刻有聚财纹。",
    slot: "ring",
    rarity: "common",
    baseStats: { spiritStoneBonus: 0.03 },
    minLevel: 1,
    possibleAffixIds: [AFFIX_IDS.PROSPEROUS, AFFIX_IDS.GUARDING]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.SPIRIT_GATHERING_RING,
    name: "聚灵戒",
    description: "能够缓慢牵引周遭灵气的戒指。",
    slot: "ring",
    rarity: "uncommon",
    baseStats: { cultivationSpeed: 0.1, spiritStoneBonus: 0.04 },
    minLevel: 4,
    possibleAffixIds: [AFFIX_IDS.QUICKENING, AFFIX_IDS.PROSPEROUS, AFFIX_IDS.FLOWING_QI]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.BLACKWIND_RING,
    name: "黑风戒",
    description: "黑风林散修首领珍藏的戒指。",
    slot: "ring",
    rarity: "rare",
    baseStats: { attack: 10, spiritStoneBonus: 0.08 },
    minLevel: 6,
    possibleAffixIds: [AFFIX_IDS.PIERCING, AFFIX_IDS.GOLDEN_LIGHT, AFFIX_IDS.MOUNTAIN_FORCE]
  },
  {
    id: EQUIPMENT_TEMPLATE_IDS.FOUNDATION_SEED_RING,
    name: "筑基种玉戒",
    description: "玉色温润的珍稀戒指，可助炼气圆满者凝练根基。",
    slot: "ring",
    rarity: "legendary",
    baseStats: { attack: 20, defense: 16, cultivationSpeed: 0.28, spiritStoneBonus: 0.16 },
    minLevel: 9,
    possibleAffixIds: [AFFIX_IDS.CLOUD_STEP, AFFIX_IDS.SPIRIT_DRAW, AFFIX_IDS.MOUNTAIN_FORCE]
  }
];

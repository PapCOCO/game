import type { ItemDefinition } from "../types";

export const ITEM_IDS = {
  WOLF_FANG: "item.wolf_fang",
  TOUGH_HIDE: "item.tough_hide",
  SPIRIT_GRASS: "item.spirit_grass",
  SERPENT_GALL: "item.serpent_gall",
  BEAR_BONE: "item.bear_bone",
  SHADOW_FEATHER: "item.shadow_feather",
  BLACKWIND_TOKEN: "item.blackwind_token",
  THORN_VINE: "item.thorn_vine",
  IRON_ORE: "item.iron_ore",
  CRACKED_JADE: "item.cracked_jade",
  GHOST_DUST: "item.ghost_dust",
  MIST_SILK: "item.mist_silk",
  LOW_SPIRIT_CORE: "item.low_spirit_core",
  QI_GATHERING_PILL: "item.qi_gathering_pill",
  HEALING_PILL: "item.healing_pill",
  SPIRIT_STONE_SHARD: "item.spirit_stone_shard"
} as const;

export const ITEMS: ItemDefinition[] = [
  {
    id: ITEM_IDS.WOLF_FANG,
    name: "灰狼牙",
    description: "青石山灰狼掉落的尖牙，可作为炼器辅材。",
    type: "material",
    rarity: "common",
    stackable: true,
    maxStack: 999
  },
  {
    id: ITEM_IDS.TOUGH_HIDE,
    name: "坚韧兽皮",
    description: "山中野兽的厚实皮革，适合缝制护具。",
    type: "material",
    rarity: "common",
    stackable: true,
    maxStack: 999
  },
  {
    id: ITEM_IDS.SPIRIT_GRASS,
    name: "凝气草",
    description: "吸纳微弱灵气的草药，是入门丹药常见材料。",
    type: "material",
    rarity: "common",
    stackable: true,
    maxStack: 999
  },
  {
    id: ITEM_IDS.SERPENT_GALL,
    name: "青蛇胆",
    description: "带有寒意的蛇胆，可用于淬炼灵力。",
    type: "material",
    rarity: "uncommon",
    stackable: true,
    maxStack: 999
  },
  {
    id: ITEM_IDS.BEAR_BONE,
    name: "石背熊骨",
    description: "沉重坚硬的熊骨，蕴含淡薄土行灵气。",
    type: "material",
    rarity: "uncommon",
    stackable: true,
    maxStack: 999
  },
  {
    id: ITEM_IDS.SHADOW_FEATHER,
    name: "影鸦羽",
    description: "黑风林影鸦的羽毛，轻若无物。",
    type: "material",
    rarity: "uncommon",
    stackable: true,
    maxStack: 999
  },
  {
    id: ITEM_IDS.BLACKWIND_TOKEN,
    name: "黑风令牌",
    description: "黑风林散修盗匪随身携带的粗糙令牌。",
    type: "material",
    rarity: "rare",
    stackable: true,
    maxStack: 999
  },
  {
    id: ITEM_IDS.THORN_VINE,
    name: "妖藤刺",
    description: "荆棘妖藤上剥离的尖刺，灵气尖锐。",
    type: "material",
    rarity: "rare",
    stackable: true,
    maxStack: 999
  },
  {
    id: ITEM_IDS.IRON_ORE,
    name: "赤纹铁矿",
    description: "废弃矿洞中残留的矿石，可用于打造兵刃。",
    type: "material",
    rarity: "common",
    stackable: true,
    maxStack: 999
  },
  {
    id: ITEM_IDS.CRACKED_JADE,
    name: "裂纹灵玉",
    description: "矿洞深处的碎裂灵玉，仍有少量灵韵。",
    type: "material",
    rarity: "uncommon",
    stackable: true,
    maxStack: 999
  },
  {
    id: ITEM_IDS.GHOST_DUST,
    name: "阴魂尘",
    description: "矿洞阴魂散去后留下的灰白尘屑。",
    type: "material",
    rarity: "rare",
    stackable: true,
    maxStack: 999
  },
  {
    id: ITEM_IDS.MIST_SILK,
    name: "雾蛛丝",
    description: "雾隐谷灵蛛吐出的细丝，柔韧且可导灵。",
    type: "material",
    rarity: "rare",
    stackable: true,
    maxStack: 999
  },
  {
    id: ITEM_IDS.LOW_SPIRIT_CORE,
    name: "低阶妖核",
    description: "低阶妖兽体内凝结的灵力核心。",
    type: "material",
    rarity: "epic",
    stackable: true,
    maxStack: 999
  },
  {
    id: ITEM_IDS.QI_GATHERING_PILL,
    name: "聚气散",
    description: "辅助炼气期修士吐纳灵气的基础丹药。",
    type: "consumable",
    rarity: "uncommon",
    stackable: true,
    maxStack: 99
  },
  {
    id: ITEM_IDS.HEALING_PILL,
    name: "回春丸",
    description: "行走山野时常备的疗伤小药。",
    type: "consumable",
    rarity: "common",
    stackable: true,
    maxStack: 99
  },
  {
    id: ITEM_IDS.SPIRIT_STONE_SHARD,
    name: "灵石碎屑",
    description: "破碎灵石边角料，可积少成多。",
    type: "currency",
    rarity: "common",
    stackable: true,
    maxStack: 9999
  }
];

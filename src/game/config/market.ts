import type { MarketItemDefinition } from "../types";

export const MARKET_ITEMS: MarketItemDefinition[] = [
  {
    id: "market.spirit_grass",
    itemId: "item.spirit_grass",
    name: "凝气草",
    price: 3,
    quantity: 20,
    rarity: "common",
    category: "material"
  },
  {
    id: "market.wolf_fang",
    itemId: "item.wolf_fang",
    name: "灰狼牙",
    price: 2,
    quantity: 15,
    rarity: "common",
    category: "material"
  },
  {
    id: "market.tough_hide",
    itemId: "item.tough_hide",
    name: "坚韧兽皮",
    price: 2,
    quantity: 15,
    rarity: "common",
    category: "material"
  },
  {
    id: "market.serpent_gall",
    itemId: "item.serpent_gall",
    name: "青蛇胆",
    price: 8,
    quantity: 10,
    rarity: "uncommon",
    category: "material"
  },
  {
    id: "market.bear_bone",
    itemId: "item.bear_bone",
    name: "石背熊骨",
    price: 8,
    quantity: 10,
    rarity: "uncommon",
    category: "material"
  },
  {
    id: "market.iron_ore",
    itemId: "item.iron_ore",
    name: "赤纹铁矿",
    price: 3,
    quantity: 20,
    rarity: "common",
    category: "material"
  },
  {
    id: "market.cracked_jade",
    itemId: "item.cracked_jade",
    name: "裂纹灵玉",
    price: 10,
    quantity: 8,
    rarity: "uncommon",
    category: "material"
  },
  {
    id: "market.shadow_feather",
    itemId: "item.shadow_feather",
    name: "影鸦羽",
    price: 12,
    quantity: 8,
    rarity: "uncommon",
    category: "material"
  },
  {
    id: "market.blackwind_token",
    itemId: "item.blackwind_token",
    name: "黑风令牌",
    price: 20,
    quantity: 5,
    rarity: "rare",
    category: "material"
  },
  {
    id: "market.thorn_vine",
    itemId: "item.thorn_vine",
    name: "妖藤刺",
    price: 18,
    quantity: 5,
    rarity: "rare",
    category: "material"
  },
  {
    id: "market.ghost_dust",
    itemId: "item.ghost_dust",
    name: "阴魂尘",
    price: 25,
    quantity: 5,
    rarity: "rare",
    category: "material"
  },
  {
    id: "market.mist_silk",
    itemId: "item.mist_silk",
    name: "雾蛛丝",
    price: 30,
    quantity: 4,
    rarity: "rare",
    category: "material"
  },
  {
    id: "market.low_spirit_core",
    itemId: "item.low_spirit_core",
    name: "低阶妖核",
    price: 80,
    quantity: 2,
    rarity: "epic",
    category: "material"
  },
  {
    id: "market.healing_pill",
    itemId: "item.healing_pill",
    name: "回春丸",
    price: 15,
    quantity: 10,
    rarity: "common",
    category: "consumable"
  },
  {
    id: "market.qi_gathering_pill",
    itemId: "item.qi_gathering_pill",
    name: "聚气散",
    price: 40,
    quantity: 5,
    rarity: "uncommon",
    category: "consumable"
  }
];

export const MARKET_REFRESH_INTERVAL_MS = 60 * 60 * 1000;
export const SELL_PRICE_RATIO = 0.4;

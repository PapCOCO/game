import type { MonsterDefinition, MonsterSpawnPool } from "../types";
import { DROP_TABLES, DROP_TABLE_IDS } from "./dropTables";

export const MONSTER_IDS = {
  GRAY_WOLF: "monster.gray_wolf",
  MOUNTAIN_BOAR: "monster.mountain_boar",
  SPIRIT_HARE: "monster.spirit_hare",
  MOSS_SERPENT: "monster.moss_serpent",
  STONEBACK_BEAR: "monster.stoneback_bear",
  SHADOW_CROW: "monster.shadow_crow",
  BLACKWIND_BANDIT: "monster.blackwind_bandit",
  THORN_DRYAD: "monster.thorn_dryad",
  CAVE_RAT: "monster.cave_rat",
  ORE_EATER: "monster.ore_eater",
  MINE_WRAITH: "monster.mine_wraith",
  MIST_SPIDER: "monster.mist_spider",
  FOG_APPARITION: "monster.fog_apparition"
} as const;

export const MONSTERS: MonsterDefinition[] = [
  {
    id: MONSTER_IDS.GRAY_WOLF,
    name: "青石灰狼",
    description: "青石山外围常见的野狼，受灵气影响比寻常野兽更凶悍。",
    level: 1,
    stats: { attack: 7, defense: 2, maxHp: 45, speed: 13, cultivationSpeed: 0, spiritStoneBonus: 0 },
    maxHp: 45,
    dropTable: DROP_TABLES[DROP_TABLE_IDS.QINGSHI_SMALL_BEAST]
  },
  {
    id: MONSTER_IDS.MOUNTAIN_BOAR,
    name: "撞山野猪",
    description: "皮糙肉厚的山猪，冲撞时会带起碎石。",
    level: 2,
    stats: { attack: 9, defense: 4, maxHp: 62, speed: 8, cultivationSpeed: 0, spiritStoneBonus: 0 },
    maxHp: 62,
    dropTable: DROP_TABLES[DROP_TABLE_IDS.QINGSHI_SMALL_BEAST]
  },
  {
    id: MONSTER_IDS.SPIRIT_HARE,
    name: "凝气灵兔",
    description: "常在灵草附近出没的小妖兽，行动敏捷。",
    level: 2,
    stats: { attack: 8, defense: 3, maxHp: 50, speed: 18, cultivationSpeed: 0, spiritStoneBonus: 0 },
    maxHp: 50,
    dropTable: DROP_TABLES[DROP_TABLE_IDS.QINGSHI_HERB_GUARD]
  },
  {
    id: MONSTER_IDS.MOSS_SERPENT,
    name: "苔纹青蛇",
    description: "鳞片覆有青苔纹路的毒蛇，守在潮湿灵草旁。",
    level: 3,
    stats: { attack: 13, defense: 5, maxHp: 76, speed: 15, cultivationSpeed: 0, spiritStoneBonus: 0 },
    maxHp: 76,
    dropTable: DROP_TABLES[DROP_TABLE_IDS.QINGSHI_HERB_GUARD]
  },
  {
    id: MONSTER_IDS.STONEBACK_BEAR,
    name: "石背熊",
    description: "背部结出石甲的山熊，炼气中期修士也不可轻敌。",
    level: 4,
    stats: { attack: 18, defense: 10, maxHp: 150, speed: 7, cultivationSpeed: 0, spiritStoneBonus: 0 },
    maxHp: 150,
    dropTable: DROP_TABLES[DROP_TABLE_IDS.QINGSHI_DEEP_BEAST]
  },
  {
    id: MONSTER_IDS.SHADOW_CROW,
    name: "影鸦",
    description: "黑风林上空盘旋的妖鸦，会从阴影中俯冲袭击。",
    level: 5,
    stats: { attack: 24, defense: 9, maxHp: 125, speed: 20, cultivationSpeed: 0, spiritStoneBonus: 0 },
    maxHp: 125,
    dropTable: DROP_TABLES[DROP_TABLE_IDS.BLACKWIND_SCOUT]
  },
  {
    id: MONSTER_IDS.BLACKWIND_BANDIT,
    name: "黑风散修",
    description: "盘踞黑风林的落魄散修，精于偷袭与搜刮。",
    level: 6,
    stats: { attack: 32, defense: 14, maxHp: 190, speed: 14, cultivationSpeed: 0, spiritStoneBonus: 0 },
    maxHp: 190,
    dropTable: DROP_TABLES[DROP_TABLE_IDS.BLACKWIND_ELITE]
  },
  {
    id: MONSTER_IDS.THORN_DRYAD,
    name: "荆棘妖藤",
    description: "吸纳黑风林阴湿灵气化生的妖藤。",
    level: 6,
    stats: { attack: 28, defense: 18, maxHp: 230, speed: 9, cultivationSpeed: 0, spiritStoneBonus: 0 },
    maxHp: 230,
    dropTable: DROP_TABLES[DROP_TABLE_IDS.BLACKWIND_ELITE]
  },
  {
    id: MONSTER_IDS.CAVE_RAT,
    name: "矿洞噬鼠",
    description: "啃食矿渣长大的巨鼠，牙齿泛着金属光泽。",
    level: 5,
    stats: { attack: 25, defense: 12, maxHp: 160, speed: 16, cultivationSpeed: 0, spiritStoneBonus: 0 },
    maxHp: 160,
    dropTable: DROP_TABLES[DROP_TABLE_IDS.MINE_BEAST]
  },
  {
    id: MONSTER_IDS.ORE_EATER,
    name: "吞矿兽",
    description: "以赤纹铁矿为食的妖兽，甲壳坚硬。",
    level: 7,
    stats: { attack: 38, defense: 26, maxHp: 310, speed: 8, cultivationSpeed: 0, spiritStoneBonus: 0 },
    maxHp: 310,
    dropTable: DROP_TABLES[DROP_TABLE_IDS.MINE_BEAST]
  },
  {
    id: MONSTER_IDS.MINE_WRAITH,
    name: "矿井阴魂",
    description: "废弃矿洞深处游荡的阴魂，会扰乱修士气息。",
    level: 8,
    stats: { attack: 45, defense: 22, maxHp: 280, speed: 12, cultivationSpeed: 0, spiritStoneBonus: 0 },
    maxHp: 280,
    dropTable: DROP_TABLES[DROP_TABLE_IDS.MINE_SPIRIT]
  },
  {
    id: MONSTER_IDS.MIST_SPIDER,
    name: "雾隐灵蛛",
    description: "潜伏雾隐谷的灵蛛，吐丝无声无息。",
    level: 8,
    stats: { attack: 52, defense: 24, maxHp: 330, speed: 18, cultivationSpeed: 0, spiritStoneBonus: 0 },
    maxHp: 330,
    dropTable: DROP_TABLES[DROP_TABLE_IDS.MIST_INSECT]
  },
  {
    id: MONSTER_IDS.FOG_APPARITION,
    name: "迷雾幻灵",
    description: "雾隐谷灵气与残念交织出的幻灵，接近筑基门槛。",
    level: 9,
    stats: { attack: 68, defense: 34, maxHp: 460, speed: 16, cultivationSpeed: 0, spiritStoneBonus: 0 },
    maxHp: 460,
    dropTable: DROP_TABLES[DROP_TABLE_IDS.MIST_SPIRIT]
  }
];

export const MONSTER_SPAWN_POOLS: MonsterSpawnPool[] = [
  {
    mapId: "map.qingshi.outskirts",
    monsters: [
      { value: MONSTER_IDS.GRAY_WOLF, weight: 44 },
      { value: MONSTER_IDS.MOUNTAIN_BOAR, weight: 34 },
      { value: MONSTER_IDS.SPIRIT_HARE, weight: 22 }
    ]
  },
  {
    mapId: "map.qingshi.depths",
    monsters: [
      { value: MONSTER_IDS.MOSS_SERPENT, weight: 38 },
      { value: MONSTER_IDS.STONEBACK_BEAR, weight: 32 },
      { value: MONSTER_IDS.SPIRIT_HARE, weight: 30 }
    ]
  },
  {
    mapId: "map.blackwind.forest",
    monsters: [
      { value: MONSTER_IDS.SHADOW_CROW, weight: 36 },
      { value: MONSTER_IDS.BLACKWIND_BANDIT, weight: 34 },
      { value: MONSTER_IDS.THORN_DRYAD, weight: 30 }
    ]
  },
  {
    mapId: "map.abandoned.mine",
    monsters: [
      { value: MONSTER_IDS.CAVE_RAT, weight: 34 },
      { value: MONSTER_IDS.ORE_EATER, weight: 36 },
      { value: MONSTER_IDS.MINE_WRAITH, weight: 30 }
    ]
  },
  {
    mapId: "map.mist.valley",
    monsters: [
      { value: MONSTER_IDS.MIST_SPIDER, weight: 58 },
      { value: MONSTER_IDS.FOG_APPARITION, weight: 42 }
    ]
  }
];

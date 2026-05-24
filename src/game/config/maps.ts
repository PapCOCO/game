import type { MapDefinition } from "../types";
import { MONSTER_IDS } from "./monsters";
import { REALM_IDS } from "./realms";

export const MAP_IDS = {
  QINGSHI_OUTSKIRTS: "map.qingshi.outskirts",
  QINGSHI_DEPTHS: "map.qingshi.depths",
  BLACKWIND_FOREST: "map.blackwind.forest",
  ABANDONED_MINE: "map.abandoned.mine",
  MIST_VALLEY: "map.mist.valley"
} as const;

export const MAPS: MapDefinition[] = [
  {
    id: MAP_IDS.QINGSHI_OUTSKIRTS,
    name: "青石山外围",
    description: "青石山脚灵气稀薄但妖兽不强，适合炼气初入门者挂机历练。",
    order: 1,
    monsterPool: [
      { value: MONSTER_IDS.GRAY_WOLF, weight: 44 },
      { value: MONSTER_IDS.MOUNTAIN_BOAR, weight: 34 },
      { value: MONSTER_IDS.SPIRIT_HARE, weight: 22 }
    ],
    baseCultivationPerSecond: 1,
    baseSpiritStonesPerMinute: 2
  },
  {
    id: MAP_IDS.QINGSHI_DEPTHS,
    name: "青石山深处",
    description: "山路转深后灵草渐多，也开始出现真正的低阶妖兽。",
    order: 2,
    unlockCondition: {
      requiredPlayerLevel: 3,
      requiredMapId: MAP_IDS.QINGSHI_OUTSKIRTS
    },
    monsterPool: [
      { value: MONSTER_IDS.MOSS_SERPENT, weight: 38 },
      { value: MONSTER_IDS.STONEBACK_BEAR, weight: 32 },
      { value: MONSTER_IDS.SPIRIT_HARE, weight: 30 }
    ],
    baseCultivationPerSecond: 1.8,
    baseSpiritStonesPerMinute: 4
  },
  {
    id: MAP_IDS.BLACKWIND_FOREST,
    name: "黑风林",
    description: "常年阴风不散的密林，妖藤与散修盗匪都在此出没。",
    order: 3,
    unlockCondition: {
      requiredPlayerLevel: 5,
      requiredRealmId: REALM_IDS.QI_4,
      requiredMapId: MAP_IDS.QINGSHI_DEPTHS
    },
    monsterPool: [
      { value: MONSTER_IDS.SHADOW_CROW, weight: 36 },
      { value: MONSTER_IDS.BLACKWIND_BANDIT, weight: 34 },
      { value: MONSTER_IDS.THORN_DRYAD, weight: 30 }
    ],
    baseCultivationPerSecond: 3,
    baseSpiritStonesPerMinute: 8
  },
  {
    id: MAP_IDS.ABANDONED_MINE,
    name: "废弃矿洞",
    description: "旧矿道深处仍有赤纹铁矿和碎玉，却也盘踞着吞矿妖兽与阴魂。",
    order: 4,
    unlockCondition: {
      requiredPlayerLevel: 7,
      requiredRealmId: REALM_IDS.QI_6,
      requiredMapId: MAP_IDS.BLACKWIND_FOREST
    },
    monsterPool: [
      { value: MONSTER_IDS.CAVE_RAT, weight: 34 },
      { value: MONSTER_IDS.ORE_EATER, weight: 36 },
      { value: MONSTER_IDS.MINE_WRAITH, weight: 30 }
    ],
    baseCultivationPerSecond: 4.4,
    baseSpiritStonesPerMinute: 12
  },
  {
    id: MAP_IDS.MIST_VALLEY,
    name: "雾隐谷",
    description: "雾气终年不散的山谷，灵气浓郁但幻象丛生，是炼气后期的试炼地。",
    order: 5,
    unlockCondition: {
      requiredPlayerLevel: 9,
      requiredRealmId: REALM_IDS.QI_8,
      requiredMapId: MAP_IDS.ABANDONED_MINE
    },
    monsterPool: [
      { value: MONSTER_IDS.MIST_SPIDER, weight: 58 },
      { value: MONSTER_IDS.FOG_APPARITION, weight: 42 }
    ],
    baseCultivationPerSecond: 6.5,
    baseSpiritStonesPerMinute: 18
  }
];

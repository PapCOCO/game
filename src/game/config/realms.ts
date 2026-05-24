import type { RealmDefinition } from "../types";

export const REALM_IDS = {
  QI_1: "realm.qi.1",
  QI_2: "realm.qi.2",
  QI_3: "realm.qi.3",
  QI_4: "realm.qi.4",
  QI_5: "realm.qi.5",
  QI_6: "realm.qi.6",
  QI_7: "realm.qi.7",
  QI_8: "realm.qi.8",
  QI_9: "realm.qi.9",
  FOUNDATION_EARLY: "realm.foundation.early"
} as const;

export const REALMS: RealmDefinition[] = [
  {
    id: REALM_IDS.QI_1,
    name: "炼气一层",
    order: 1,
    cultivationRequired: 0,
    breakthroughRate: 1,
    baseStats: {
      attack: 8,
      defense: 4,
      maxHp: 80,
      cultivationSpeed: 1,
      spiritStoneBonus: 0
    }
  },
  {
    id: REALM_IDS.QI_2,
    name: "炼气二层",
    order: 2,
    cultivationRequired: 120,
    breakthroughRate: 0.95,
    baseStats: {
      attack: 11,
      defense: 6,
      maxHp: 105,
      cultivationSpeed: 1.15,
      spiritStoneBonus: 0.02
    }
  },
  {
    id: REALM_IDS.QI_3,
    name: "炼气三层",
    order: 3,
    cultivationRequired: 300,
    breakthroughRate: 0.9,
    baseStats: {
      attack: 15,
      defense: 8,
      maxHp: 135,
      cultivationSpeed: 1.35,
      spiritStoneBonus: 0.04
    }
  },
  {
    id: REALM_IDS.QI_4,
    name: "炼气四层",
    order: 4,
    cultivationRequired: 620,
    breakthroughRate: 0.82,
    baseStats: {
      attack: 20,
      defense: 11,
      maxHp: 170,
      cultivationSpeed: 1.6,
      spiritStoneBonus: 0.06
    }
  },
  {
    id: REALM_IDS.QI_5,
    name: "炼气五层",
    order: 5,
    cultivationRequired: 1100,
    breakthroughRate: 0.75,
    baseStats: {
      attack: 26,
      defense: 15,
      maxHp: 215,
      cultivationSpeed: 1.9,
      spiritStoneBonus: 0.08
    }
  },
  {
    id: REALM_IDS.QI_6,
    name: "炼气六层",
    order: 6,
    cultivationRequired: 1800,
    breakthroughRate: 0.68,
    baseStats: {
      attack: 34,
      defense: 20,
      maxHp: 270,
      cultivationSpeed: 2.25,
      spiritStoneBonus: 0.11
    }
  },
  {
    id: REALM_IDS.QI_7,
    name: "炼气七层",
    order: 7,
    cultivationRequired: 2900,
    breakthroughRate: 0.58,
    baseStats: {
      attack: 44,
      defense: 26,
      maxHp: 340,
      cultivationSpeed: 2.7,
      spiritStoneBonus: 0.14
    }
  },
  {
    id: REALM_IDS.QI_8,
    name: "炼气八层",
    order: 8,
    cultivationRequired: 4500,
    breakthroughRate: 0.48,
    baseStats: {
      attack: 57,
      defense: 34,
      maxHp: 430,
      cultivationSpeed: 3.25,
      spiritStoneBonus: 0.18
    }
  },
  {
    id: REALM_IDS.QI_9,
    name: "炼气九层",
    order: 9,
    cultivationRequired: 7000,
    breakthroughRate: 0.36,
    baseStats: {
      attack: 74,
      defense: 44,
      maxHp: 550,
      cultivationSpeed: 4,
      spiritStoneBonus: 0.23
    }
  },
  {
    id: REALM_IDS.FOUNDATION_EARLY,
    name: "筑基初期",
    order: 10,
    cultivationRequired: 11000,
    breakthroughRate: 0.24,
    baseStats: {
      attack: 105,
      defense: 66,
      maxHp: 820,
      cultivationSpeed: 5.5,
      spiritStoneBonus: 0.35
    }
  }
];

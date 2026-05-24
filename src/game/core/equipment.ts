import type {
  CoreStats,
  EquipmentInstance,
  EquipmentSlot,
  GameLogEntry,
  GameSaveData,
  StatModifier
} from "../types";
import { calculateFinalStats, getEquipmentByInstanceId } from "./selectors";
import { createId } from "./random";

const CORE_STAT_KEYS: Array<keyof CoreStats> = [
  "attack",
  "defense",
  "maxHp",
  "cultivationSpeed",
  "spiritStoneBonus"
];

const STAT_LABELS: Record<keyof CoreStats, string> = {
  attack: "攻击",
  defense: "防御",
  maxHp: "气血",
  cultivationSpeed: "修炼速度",
  spiritStoneBonus: "灵石加成"
};

const SCORE_WEIGHTS: Record<keyof CoreStats, number> = {
  attack: 2,
  defense: 1.5,
  maxHp: 0.2,
  cultivationSpeed: 15,
  spiritStoneBonus: 100
};

function formatStatValue(stat: keyof CoreStats, value: number): string {
  if (stat === "spiritStoneBonus") {
    return `${(value * 100).toFixed(1)}%`;
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function describeModifier(modifier: StatModifier): string {
  const prefix = modifier.value >= 0 ? "+" : "";

  if (modifier.type === "percent") {
    return `${STAT_LABELS[modifier.stat]} ${prefix}${(modifier.value * 100).toFixed(1)}%`;
  }

  return `${STAT_LABELS[modifier.stat]} ${prefix}${formatStatValue(
    modifier.stat,
    modifier.value
  )}`;
}

function appendEquipmentLog(save: GameSaveData, message: string, now: number): GameSaveData {
  const entry: GameLogEntry = {
    id: createId("log"),
    type: "equipment",
    message,
    createdAt: now
  };

  return {
    ...save,
    logs: {
      ...save.logs,
      entries: [entry, ...save.logs.entries].slice(0, save.logs.maxEntries)
    }
  };
}

function touchSave(save: GameSaveData, now: number): GameSaveData {
  return {
    ...save,
    meta: {
      ...save.meta,
      updatedAt: now
    },
    runtime: {
      ...save.runtime,
      time: {
        ...save.runtime.time,
        updatedAt: now,
        lastSavedAt: now
      }
    }
  };
}

function recalculateFinalStats(save: GameSaveData): GameSaveData {
  return {
    ...save,
    player: {
      ...save.player,
      finalStats: calculateFinalStats(save)
    }
  };
}

function getModifierScore(modifier: StatModifier): number {
  const rawValue = modifier.type === "percent" ? modifier.value * 100 : modifier.value;

  return rawValue * SCORE_WEIGHTS[modifier.stat];
}

export function canEquip(save: GameSaveData, equipmentInstanceId: string): boolean {
  return getEquipmentByInstanceId(save, equipmentInstanceId) !== undefined;
}

export function calculateEquipmentScore(equipment: EquipmentInstance): number {
  let score = 0;

  for (const stat of CORE_STAT_KEYS) {
    score += (equipment.baseStats[stat] ?? 0) * SCORE_WEIGHTS[stat];
  }

  for (const affix of equipment.affixes) {
    for (const modifier of affix.modifiers) {
      score += getModifierScore(modifier);
    }
  }

  return Math.max(0, Math.round(score * 100) / 100);
}

export function formatEquipmentStats(equipment: EquipmentInstance): string {
  const baseStats = CORE_STAT_KEYS.flatMap((stat) => {
    const value = equipment.baseStats[stat];
    return value === undefined || value === 0
      ? []
      : [`${STAT_LABELS[stat]} +${formatStatValue(stat, value)}`];
  });
  const affixStats = equipment.affixes.flatMap((affix) =>
    affix.modifiers.map((modifier) => `${affix.name}: ${describeModifier(modifier)}`)
  );
  const parts = [...baseStats, ...affixStats];

  return parts.length > 0 ? parts.join("、") : "无属性";
}

export function equipItem(
  save: GameSaveData,
  equipmentInstanceId: string,
  now = Date.now()
): GameSaveData {
  const equipment = getEquipmentByInstanceId(save, equipmentInstanceId);

  if (equipment === undefined) {
    return save;
  }

  const equippedSave: GameSaveData = {
    ...save,
    player: {
      ...save.player,
      equipped: {
        ...save.player.equipped,
        [equipment.slot]: equipment.instanceId
      }
    }
  };

  return appendEquipmentLog(
    recalculateFinalStats(touchSave(equippedSave, now)),
    `已装备${equipment.name}。`,
    now
  );
}

export function unequipItem(
  save: GameSaveData,
  slot: EquipmentSlot,
  now = Date.now()
): GameSaveData {
  const currentInstanceId = save.player.equipped[slot];

  if (currentInstanceId === undefined) {
    return save;
  }

  const equipment = getEquipmentByInstanceId(save, currentInstanceId);
  const nextEquipped = { ...save.player.equipped };
  delete nextEquipped[slot];

  const unequippedSave: GameSaveData = {
    ...save,
    player: {
      ...save.player,
      equipped: nextEquipped
    }
  };

  return appendEquipmentLog(
    recalculateFinalStats(touchSave(unequippedSave, now)),
    `已卸下${equipment?.name ?? "装备"}。`,
    now
  );
}

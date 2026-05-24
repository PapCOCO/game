import type {
  BattleStats,
  CoreStats,
  EquipmentInstance,
  EquipmentSlot,
  GameSaveData,
  ID,
  MapDefinition,
  RealmDefinition,
  StatModifier
} from "../types";
import { EMPTY_CORE_STATS } from "../types";
import { MAPS, REALMS } from "../config";
import { getUnlockedMapIdsByRealm } from "./mapUnlock";
import { getLearnedTechniques } from "./technique";
import { getEnhancementStats } from "./enhancement";

const CORE_STAT_KEYS: Array<keyof CoreStats> = [
  "attack",
  "defense",
  "maxHp",
  "speed",
  "cultivationSpeed",
  "spiritStoneBonus"
];

function createEmptyStats(): CoreStats {
  return { ...EMPTY_CORE_STATS };
}

function addStats(target: CoreStats, source: Partial<CoreStats>): void {
  for (const stat of CORE_STAT_KEYS) {
    target[stat] += source[stat] ?? 0;
  }
}

function applyModifier(target: CoreStats, modifier: StatModifier): void {
  if (modifier.type === "flat") {
    target[modifier.stat] += modifier.value;
    return;
  }

  target[modifier.stat] += target[modifier.stat] * modifier.value;
}

function getNextRealm(currentRealm: RealmDefinition | undefined): RealmDefinition | undefined {
  if (currentRealm === undefined) {
    return undefined;
  }

  return REALMS.filter((realm) => realm.order > currentRealm.order).sort(
    (first, second) => first.order - second.order
  )[0];
}

export function getRealmById(realmId: ID): RealmDefinition | undefined {
  return REALMS.find((realm) => realm.id === realmId);
}

export function getCurrentRealm(save: GameSaveData): RealmDefinition | undefined {
  return getRealmById(save.player.realmId);
}

export function getCurrentMap(save: GameSaveData): MapDefinition | undefined {
  return MAPS.find((map) => map.id === save.map.currentMapId);
}

export function getEquipmentByInstanceId(
  save: GameSaveData,
  instanceId: ID
): EquipmentInstance | undefined {
  return save.inventory.equipments.find((equipment) => equipment.instanceId === instanceId);
}

export function getEquippedEquipment(
  save: GameSaveData
): Partial<Record<EquipmentSlot, EquipmentInstance>> {
  const equippedEquipment: Partial<Record<EquipmentSlot, EquipmentInstance>> = {};

  for (const slot of Object.keys(save.player.equipped) as EquipmentSlot[]) {
    const instanceId = save.player.equipped[slot];

    if (instanceId === undefined) {
      continue;
    }

    const equipment = getEquipmentByInstanceId(save, instanceId);

    if (equipment !== undefined) {
      equippedEquipment[slot] = equipment;
    }
  }

  return equippedEquipment;
}

export function calculateEquipmentStats(equipment: EquipmentInstance): CoreStats {
  const stats = createEmptyStats();
  const enhancedStats = getEnhancementStats(equipment.baseStats, equipment.enhancement);

  addStats(stats, enhancedStats);

  for (const affix of equipment.affixes) {
    for (const modifier of affix.modifiers) {
      applyModifier(stats, modifier);
    }
  }

  return stats;
}

export function calculateFinalStats(save: GameSaveData): BattleStats {
  const stats = createEmptyStats();
  const currentRealm = getCurrentRealm(save);
  const equippedEquipment = Object.values(getEquippedEquipment(save));

  addStats(stats, save.player.baseStats);

  if (currentRealm !== undefined) {
    addStats(stats, currentRealm.baseStats);
  }

  for (const equipment of equippedEquipment) {
    const enhancedStats = getEnhancementStats(equipment.baseStats, equipment.enhancement);
    addStats(stats, enhancedStats);
  }

  for (const equipment of equippedEquipment) {
    for (const affix of equipment.affixes) {
      for (const modifier of affix.modifiers) {
        applyModifier(stats, modifier);
      }
    }
  }

  for (const technique of getLearnedTechniques(save)) {
    for (const modifier of technique.modifiers) {
      applyModifier(stats, modifier);
    }
  }

  return {
    ...stats,
    currentHp: stats.maxHp
  };
}

export function getCultivationRequired(save: GameSaveData): number {
  const nextRealm = getNextRealm(getCurrentRealm(save));

  return nextRealm?.cultivationRequired ?? getCurrentRealm(save)?.cultivationRequired ?? 0;
}

export function getCultivationProgress(save: GameSaveData): number {
  const required = getCultivationRequired(save);

  if (required <= 0) {
    return 1;
  }

  return Math.min(1, Math.max(0, save.player.cultivation.currentCultivation / required));
}

export function getPlayerPower(save: GameSaveData): number {
  const stats = calculateFinalStats(save);

  return stats.attack * 2 + stats.defense * 1.5 + stats.maxHp * 0.2 + stats.speed * 1.2;
}

export function getUnlockedMaps(save: GameSaveData): MapDefinition[] {
  const unlockedMapIds = new Set(getUnlockedMapIdsByRealm(save.player.realmId));

  return MAPS.filter((map) => unlockedMapIds.has(map.id)).sort(
    (first, second) => first.order - second.order
  );
}

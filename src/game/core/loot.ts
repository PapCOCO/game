import type { EquipmentAffixInstance, EquipmentInstance, Rarity } from "../types";
import { AFFIXES, EQUIPMENT_TEMPLATES, MAPS, MONSTERS } from "../config";
import { createId, randomChance, randomInt } from "./random";

export type LootResult = {
  spiritStones: number;
  cultivation: number;
  items: Array<{ itemId: string; quantity: number }>;
  equipments: EquipmentInstance[];
};

function getMapBaseSpiritStones(monsterId: string): number {
  const map = MAPS.find((m) => m.monsterPool.some((pool) => pool.value === monsterId));
  if (map === undefined) return 0;
  return Math.round(map.baseSpiritStonesPerMinute / 60);
}

function rollRange(range: { min: number; max: number }): number {
  return randomInt(range.min, range.max);
}

function getAffixCount(rarity: Rarity): number {
  switch (rarity) {
    case "common":
      return randomInt(0, 1);
    case "uncommon":
      return 1;
    case "rare":
      return randomInt(1, 2);
    case "epic":
      return 2;
    case "legendary":
      return randomInt(2, 3);
  }
}

function createAffixes(possibleAffixIds: string[], rarity: Rarity): EquipmentAffixInstance[] {
  const affixes: EquipmentAffixInstance[] = [];
  const remainingAffixIds = [...new Set(possibleAffixIds)];
  const affixCount = Math.min(getAffixCount(rarity), remainingAffixIds.length);

  for (let index = 0; index < affixCount; index += 1) {
    const selectedIndex = randomInt(0, remainingAffixIds.length - 1);
    const [affixId] = remainingAffixIds.splice(selectedIndex, 1);
    const affixDefinition = AFFIXES.find((affix) => affix.id === affixId);

    if (affixDefinition === undefined) {
      continue;
    }

    affixes.push({
      affixId: affixDefinition.id,
      name: affixDefinition.name,
      modifiers: affixDefinition.modifiers
    });
  }

  return affixes;
}

function createEquipmentInstance(equipmentId: string, now: number): EquipmentInstance | null {
  const template = EQUIPMENT_TEMPLATES.find((equipment) => equipment.id === equipmentId);

  if (template === undefined) {
    return null;
  }

  return {
    instanceId: createId("eq"),
    equipmentId: template.id,
    name: template.name,
    slot: template.slot,
    rarity: template.rarity,
    baseStats: template.baseStats,
    affixes: createAffixes(template.possibleAffixIds, template.rarity),
    level: 1,
    locked: false,
    enhancement: 0,
    createdAt: now
  };
}

export function generateLoot(monsterId: string, now = Date.now()): LootResult {
  const monster = MONSTERS.find((entry) => entry.id === monsterId);

  if (monster === undefined) {
    return {
      spiritStones: 0,
      cultivation: 0,
      items: [],
      equipments: []
    };
  }

  const items = monster.dropTable.items
    .filter((item) => randomChance(item.dropRate))
    .map((item) => ({
      itemId: item.itemId,
      quantity: rollRange(item.quantity)
    }))
    .filter((item) => item.quantity > 0);
  const equipments = monster.dropTable.equipments
    .filter((equipment) => randomChance(equipment.dropRate))
    .map((equipment) => createEquipmentInstance(equipment.equipmentId, now))
    .filter((equipment): equipment is EquipmentInstance => equipment !== null);

  const mapBaseStones = getMapBaseSpiritStones(monsterId);
  const totalSpiritStones = rollRange(monster.dropTable.spiritStones) + mapBaseStones;

  return {
    spiritStones: totalSpiritStones,
    cultivation: rollRange(monster.dropTable.cultivation),
    items,
    equipments
  };
}

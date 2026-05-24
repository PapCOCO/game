import type { GameSaveData, ID, MapDefinition } from "../types";
import { MAPS, REALMS } from "../config";

function getRealmOrder(realmId: ID): number | null {
  return REALMS.find((realm) => realm.id === realmId)?.order ?? null;
}

export function getUnlockedMapIdsByRealm(realmId: ID): ID[] {
  const realmOrder = getRealmOrder(realmId);

  if (realmOrder === null) {
    return MAPS.filter((map) => map.unlockCondition === undefined).map((map) => map.id);
  }

  return MAPS.filter((map) => {
    const requiredRealmId = map.unlockCondition?.requiredRealmId;

    if (requiredRealmId === undefined) {
      return true;
    }

    const requiredRealmOrder = getRealmOrder(requiredRealmId);

    return requiredRealmOrder !== null && realmOrder >= requiredRealmOrder;
  }).map((map) => map.id);
}

export function isMapUnlocked(mapId: ID, realmId: ID): boolean {
  if (!MAPS.some((map) => map.id === mapId)) {
    return false;
  }

  return getUnlockedMapIdsByRealm(realmId).includes(mapId);
}

function isRealmConditionMet(save: GameSaveData, requiredRealmId: ID | undefined): boolean {
  if (requiredRealmId === undefined) {
    return true;
  }

  const currentRealmOrder = getRealmOrder(save.player.realmId);
  const requiredRealmOrder = getRealmOrder(requiredRealmId);

  return (
    currentRealmOrder !== null &&
    requiredRealmOrder !== null &&
    currentRealmOrder >= requiredRealmOrder
  );
}

function isMapConditionMet(
  save: GameSaveData,
  map: MapDefinition,
  unlockedMapIds: ReadonlySet<ID>
): boolean {
  const condition = map.unlockCondition;

  if (condition === undefined) {
    return true;
  }

  if (!isRealmConditionMet(save, condition.requiredRealmId)) {
    return false;
  }

  if (
    condition.requiredPlayerLevel !== undefined &&
    save.player.level < condition.requiredPlayerLevel
  ) {
    return false;
  }

  if (
    condition.requiredMapId !== undefined &&
    !unlockedMapIds.has(condition.requiredMapId)
  ) {
    return false;
  }

  return true;
}

export function getUnlockedMapIds(save: GameSaveData): ID[] {
  const validMapIds = new Set(MAPS.map((map) => map.id));
  const unlockedMapIds = new Set<ID>(
    [
      ...(save.player.progress.unlockedMapIds ?? []),
      ...(save.map.unlockedMapIds ?? [])
    ].filter((mapId) => validMapIds.has(mapId))
  );

  let changed = true;

  while (changed) {
    changed = false;

    for (const map of MAPS) {
      if (unlockedMapIds.has(map.id)) {
        continue;
      }

      if (isMapConditionMet(save, map, unlockedMapIds)) {
        unlockedMapIds.add(map.id);
        changed = true;
      }
    }
  }

  return MAPS.filter((map) => unlockedMapIds.has(map.id))
    .sort((first, second) => first.order - second.order)
    .map((map) => map.id);
}

export function isMapUnlockedForSave(save: GameSaveData, mapId: ID): boolean {
  if (!MAPS.some((map) => map.id === mapId)) {
    return false;
  }

  return getUnlockedMapIds(save).includes(mapId);
}

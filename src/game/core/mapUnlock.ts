import type { ID } from "../types";
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

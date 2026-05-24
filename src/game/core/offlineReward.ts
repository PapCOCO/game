import type { GameSaveData, OfflineRewardSummary, EquipmentInstance } from "../types";
import { getCultivationGainPerSecond } from "./cultivation";
import { calculateFinalStats } from "./selectors";
import { pickWeighted } from "./random";
import { MAPS, MONSTERS } from "../config";
import { generateLoot } from "./loot";
import { addEquipments, addItemStacks } from "./inventory";

const OFFLINE_BATTLE_EFFICIENCY = 0.6;
const OFFLINE_CULTIVATION_EFFICIENCY = 0.5;

function estimateBattlesPerMinute(save: GameSaveData): number {
  const finalStats = calculateFinalStats(save);
  const currentMap = MAPS.find((map) => map.id === save.map.currentMapId);

  if (currentMap === undefined || currentMap.monsterPool.length === 0) {
    return 0;
  }

  const monsterId = pickWeighted(currentMap.monsterPool);
  if (monsterId === null) return 0;

  const monster = MONSTERS.find((m) => m.id === monsterId);
  if (monster === undefined) return 0;

  const playerPower = finalStats.attack * 2 + finalStats.defense * 1.5 + finalStats.maxHp * 0.2;
  const monsterPower =
    monster.stats.attack * 2 + monster.stats.defense * 1.5 + monster.stats.maxHp * 0.2;

  if (playerPower <= 0) return 0;

  const powerRatio = playerPower / Math.max(1, monsterPower);

  if (powerRatio < 0.8) {
    return 2;
  }

  if (powerRatio < 1.5) {
    return 4;
  }

  return 7;
}

export function calculateOfflineReward(
  save: GameSaveData,
  now = Date.now()
): { save: GameSaveData; summary: OfflineRewardSummary } {
  if (!save.settings.offlineRewardEnabled) {
    return {
      save,
      summary: {
        offlineDurationMs: 0,
        cappedDurationMs: 0,
        cultivationGained: 0,
        spiritStonesGained: 0,
        itemsGained: [],
        equipmentGained: []
      }
    };
  }

  const offlineDurationMs = now - save.runtime.time.lastActiveAt;

  if (offlineDurationMs <= 0) {
    return {
      save,
      summary: {
        offlineDurationMs: 0,
        cappedDurationMs: 0,
        cultivationGained: 0,
        spiritStonesGained: 0,
        itemsGained: [],
        equipmentGained: []
      }
    };
  }

  const capMs = save.settings.offlineRewardCapMs;
  const cappedDurationMs = Math.min(offlineDurationMs, capMs);
  const cappedDurationSeconds = cappedDurationMs / 1000;

  const cultivationPerSecond = getCultivationGainPerSecond(save);
  const cultivationGained = Math.floor(
    cappedDurationSeconds * cultivationPerSecond * OFFLINE_CULTIVATION_EFFICIENCY
  );

  const battlesPerMinute = estimateBattlesPerMinute(save);
  const totalBattles = Math.floor(
    (cappedDurationSeconds / 60) * battlesPerMinute * OFFLINE_BATTLE_EFFICIENCY
  );

  let spiritStonesGained = 0;
  const itemsGained: Array<{ itemId: string; quantity: number }> = [];
  const equipmentInstances: EquipmentInstance[] = [];

  const currentMap = MAPS.find((map) => map.id === save.map.currentMapId);

  if (currentMap !== undefined && totalBattles > 0) {
    for (let i = 0; i < totalBattles; i++) {
      const monsterId = pickWeighted(currentMap.monsterPool);
      if (monsterId === null) continue;

      const monster = MONSTERS.find((m) => m.id === monsterId);
      if (monster === undefined) continue;

      const loot = generateLoot(monsterId, now);

      spiritStonesGained += loot.spiritStones;

      for (const item of loot.items) {
        const existing = itemsGained.find((ig) => ig.itemId === item.itemId);
        if (existing !== undefined) {
          existing.quantity += item.quantity;
        } else {
          itemsGained.push({ itemId: item.itemId, quantity: item.quantity });
        }
      }

      for (const equipment of loot.equipments) {
        equipmentInstances.push(equipment);
      }
    }
  }

  const finalStats = calculateFinalStats(save);
  const adjustedSpiritStonesGained = Math.floor(
    spiritStonesGained * (1 + finalStats.spiritStoneBonus)
  );
  const equipmentGained = equipmentInstances.map((eq) => eq.instanceId);

  const summary: OfflineRewardSummary = {
    offlineDurationMs,
    cappedDurationMs,
    cultivationGained,
    spiritStonesGained: adjustedSpiritStonesGained,
    itemsGained,
    equipmentGained
  };

  let nextSave: GameSaveData = {
    ...save,
    player: {
      ...save.player,
      cultivation: {
        ...save.player.cultivation,
        currentCultivation: save.player.cultivation.currentCultivation + cultivationGained,
        totalCultivation: save.player.cultivation.totalCultivation + cultivationGained
      }
    },
    runtime: {
      ...save.runtime,
      lastOfflineReward: summary,
      time: {
        ...save.runtime.time,
        updatedAt: now,
        lastActiveAt: now
      }
    }
  };

  if (adjustedSpiritStonesGained > 0) {
    nextSave = {
      ...nextSave,
      player: {
        ...nextSave.player,
        spiritStones: nextSave.player.spiritStones + adjustedSpiritStonesGained
      }
    };
  }

  if (itemsGained.length > 0) {
    nextSave = addItemStacks(nextSave, itemsGained);
  }

  if (equipmentInstances.length > 0) {
    nextSave = addEquipments(nextSave, equipmentInstances);
  }

  return { save: nextSave, summary };
}

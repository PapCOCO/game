import type {
  GameSaveData,
  ObjectiveDefinition,
  ObjectiveProgress,
  ObjectiveState,
  ObjectiveType
} from "../types";
import { OBJECTIVES } from "../config/objectives";
import { REALMS } from "../config";
import { addItemStacks } from "./inventory";
import { appendLog, touchSave } from "./saveUtils";

export type ObjectiveEvent =
  | { type: "defeat"; amount?: number }
  | { type: "cultivation" }
  | { type: "breakthrough" }
  | { type: "enhance"; level?: number }
  | { type: "collect" }
  | { type: "alchemy" }
  | { type: "estate"; amount?: number }
  | { type: "equip" };

export function createInitialObjectiveState(): ObjectiveState {
  return {
    progress: OBJECTIVES.map((objective) => ({
      definitionId: objective.id,
      current: 0,
      completed: false,
      claimed: false
    }))
  };
}

function getRealmOrder(realmId: string): number {
  return REALMS.find((realm) => realm.id === realmId)?.order ?? 1;
}

function getDerivedCurrent(save: GameSaveData, objective: ObjectiveDefinition): number {
  switch (objective.type) {
    case "defeat":
      return save.autoBattle.defeatedCount;
    case "cultivation":
      return Math.floor(save.player.cultivation.totalCultivation);
    case "collect":
      return save.player.spiritStones;
    case "equip":
      return Object.values(save.player.equipped).some((instanceId) => instanceId !== undefined)
        ? 1
        : 0;
    case "enhance":
      return save.inventory.equipments.reduce(
        (maxLevel, equipment) => Math.max(maxLevel, equipment.enhancement ?? 0),
        0
      );
    case "alchemy":
      return save.alchemy.totalSuccesses;
    case "breakthrough":
      return Math.max(0, getRealmOrder(save.player.realmId) - 1);
    case "estate":
      return save.estate.spiritFields.some((field) => field.cropItemId !== null) ? 1 : 0;
  }
}

function getEventCurrent(
  progress: ObjectiveProgress,
  objective: ObjectiveDefinition,
  event?: ObjectiveEvent
): number {
  if (event === undefined || event.type !== objective.type) {
    return progress.current;
  }

  if (event.type === "defeat" || event.type === "estate") {
    return progress.current + (event.amount ?? 1);
  }

  if (event.type === "enhance") {
    return Math.max(progress.current, event.level ?? 1);
  }

  return Math.max(progress.current, 1);
}

export function normalizeObjectiveState(
  state: ObjectiveState | undefined,
  save?: GameSaveData
): ObjectiveState {
  const existingProgress = new Map(
    (state?.progress ?? []).map((progress) => [progress.definitionId, progress])
  );

  return {
    progress: OBJECTIVES.map((objective) => {
      const existing = existingProgress.get(objective.id);
      const derivedCurrent = save === undefined ? 0 : getDerivedCurrent(save, objective);
      const current = Math.min(
        objective.target,
        Math.max(0, existing?.current ?? 0, derivedCurrent)
      );

      return {
        definitionId: objective.id,
        current,
        completed: existing?.completed ?? current >= objective.target,
        claimed: existing?.claimed ?? false
      };
    })
  };
}

export function updateObjectives(save: GameSaveData, event?: ObjectiveEvent): GameSaveData {
  const normalized = normalizeObjectiveState(save.objectives, save);
  let changed = normalized.progress.length !== save.objectives.progress.length;

  const progress = normalized.progress.map((entry) => {
    const objective = OBJECTIVES.find((definition) => definition.id === entry.definitionId);

    if (objective === undefined) {
      return entry;
    }

    const eventCurrent = getEventCurrent(entry, objective, event);
    const derivedCurrent = getDerivedCurrent(save, objective);
    const current = Math.min(objective.target, Math.max(entry.current, eventCurrent, derivedCurrent));
    const completed = entry.completed || current >= objective.target;

    if (current !== entry.current || completed !== entry.completed) {
      changed = true;
    }

    return {
      ...entry,
      current,
      completed
    };
  });

  if (!changed) {
    return save;
  }

  return {
    ...save,
    objectives: {
      progress
    }
  };
}

function describeReward(reward: ObjectiveDefinition["reward"]): string {
  const parts: string[] = [];

  if (reward.spiritStones !== undefined && reward.spiritStones > 0) {
    parts.push(`灵石 x${reward.spiritStones}`);
  }

  if (reward.cultivation !== undefined && reward.cultivation > 0) {
    parts.push(`修为 x${reward.cultivation}`);
  }

  for (const item of reward.items ?? []) {
    parts.push(`${item.itemId} x${item.quantity}`);
  }

  return parts.length > 0 ? parts.join("、") : "无";
}

export function getObjectiveDefinition(objectiveId: string): ObjectiveDefinition | undefined {
  return OBJECTIVES.find((objective) => objective.id === objectiveId);
}

export function getObjectiveTypeLabel(type: ObjectiveType): string {
  switch (type) {
    case "defeat":
      return "战斗";
    case "cultivation":
      return "修为";
    case "breakthrough":
      return "突破";
    case "enhance":
      return "强化";
    case "collect":
      return "收集";
    case "alchemy":
      return "炼丹";
    case "estate":
      return "洞府";
    case "equip":
      return "装备";
  }
}

export function claimObjectiveReward(
  save: GameSaveData,
  objectiveId: string,
  now = Date.now()
): { save: GameSaveData; success: boolean; message: string } {
  const objective = getObjectiveDefinition(objectiveId);

  if (objective === undefined) {
    return { save, success: false, message: "目标不存在。" };
  }

  const normalized = normalizeObjectiveState(save.objectives, save);
  const progress = normalized.progress.find((entry) => entry.definitionId === objectiveId);

  if (progress === undefined || !progress.completed) {
    return { save, success: false, message: "目标尚未完成。" };
  }

  if (progress.claimed) {
    return { save, success: false, message: "目标奖励已领取。" };
  }

  let nextSave: GameSaveData = {
    ...save,
    objectives: {
      progress: normalized.progress.map((entry) =>
        entry.definitionId === objectiveId ? { ...entry, claimed: true } : entry
      )
    }
  };

  if (objective.reward.items !== undefined && objective.reward.items.length > 0) {
    nextSave = addItemStacks(nextSave, objective.reward.items);
  }

  nextSave = {
    ...nextSave,
    player: {
      ...nextSave.player,
      spiritStones: nextSave.player.spiritStones + (objective.reward.spiritStones ?? 0),
      cultivation: {
        ...nextSave.player.cultivation,
        currentCultivation:
          nextSave.player.cultivation.currentCultivation + (objective.reward.cultivation ?? 0),
        totalCultivation:
          nextSave.player.cultivation.totalCultivation + (objective.reward.cultivation ?? 0)
      }
    }
  };

  nextSave = touchSave(nextSave, now);
  nextSave = appendLog(
    nextSave,
    "objective",
    `完成目标「${objective.title}」，领取奖励：${describeReward(objective.reward)}。`,
    now
  );
  nextSave = updateObjectives(nextSave, { type: "collect" });
  nextSave = updateObjectives(nextSave, { type: "cultivation" });

  return {
    save: nextSave,
    success: true,
    message: `已领取「${objective.title}」奖励。`
  };
}

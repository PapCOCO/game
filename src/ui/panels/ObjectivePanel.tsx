import type { GameSaveData, ObjectiveDefinition } from "../../game/types";
import { ITEMS, OBJECTIVES } from "../../game/config";
import { getObjectiveTypeLabel } from "../../game/core/objectives";
import { useGameStore } from "../../game/state/gameStore";
import { ProgressBar } from "../components/ProgressBar";

function getItemName(itemId: string): string {
  return ITEMS.find((item) => item.id === itemId)?.name ?? itemId;
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
    parts.push(`${getItemName(item.itemId)} x${item.quantity}`);
  }

  return parts.length > 0 ? parts.join("、") : "无";
}

export function ObjectivePanel({ save }: { save: GameSaveData }) {
  const { claimObjective } = useGameStore();
  const progressById = new Map(
    save.objectives.progress.map((progress) => [progress.definitionId, progress])
  );
  const sortedObjectives = [...OBJECTIVES].sort((first, second) => {
    const firstProgress = progressById.get(first.id);
    const secondProgress = progressById.get(second.id);
    const firstRank = firstProgress?.claimed ? 2 : firstProgress?.completed ? 0 : 1;
    const secondRank = secondProgress?.claimed ? 2 : secondProgress?.completed ? 0 : 1;

    return firstRank - secondRank;
  });

  return (
    <section className="panel objective-panel">
      <div className="panel-heading">
        <span className="eyebrow">Goals</span>
        <h2>修行目标</h2>
      </div>

      <div className="objective-list" aria-label="修行目标列表">
        {sortedObjectives.map((objective) => {
          const progress = progressById.get(objective.id);
          const current = Math.min(objective.target, Math.max(0, progress?.current ?? 0));
          const completed = progress?.completed ?? current >= objective.target;
          const claimed = progress?.claimed ?? false;

          return (
            <div
              className={
                claimed
                  ? "objective-row objective-row-claimed"
                  : completed
                    ? "objective-row objective-row-complete"
                    : "objective-row"
              }
              key={objective.id}
            >
              <div className="objective-row-header">
                <div>
                  <strong>{objective.title}</strong>
                  <span>{getObjectiveTypeLabel(objective.type)}</span>
                </div>
                <small>
                  {current} / {objective.target}
                </small>
              </div>
              <p>{objective.description}</p>
              <ProgressBar value={objective.target <= 0 ? 1 : current / objective.target} />
              <div className="objective-reward-row">
                <span>{describeReward(objective.reward)}</span>
                {claimed ? (
                  <button className="text-button" disabled type="button">
                    已完成
                  </button>
                ) : completed ? (
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => void claimObjective(objective.id)}
                  >
                    领取
                  </button>
                ) : (
                  <button className="text-button" disabled type="button">
                    进行中
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

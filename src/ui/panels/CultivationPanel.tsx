import type { GameSaveData } from "../../game/types";
import {
  getCultivationProgress,
  getCultivationRequired
} from "../../game/core/selectors";
import { canBreakthrough, getCultivationGainPerSecond } from "../../game/core/cultivation";
import { getNextRealm } from "../../game/core/breakthrough";
import { useGameStore } from "../../game/state/gameStore";
import { ProgressBar } from "../components/ProgressBar";
import { StatBlock } from "../components/StatBlock";

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function CultivationPanel({ save }: { save: GameSaveData }) {
  const { breakthroughNow } = useGameStore();
  const required = getCultivationRequired(save);
  const progress = getCultivationProgress(save);
  const gainPerSecond = getCultivationGainPerSecond(save);
  const nextRealm = getNextRealm(save);
  const breakthroughAvailable = canBreakthrough(save);
  const isMaxRealm = nextRealm === null;

  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="eyebrow">Cultivation</span>
        <h2>修为进境</h2>
      </div>

      <ProgressBar value={progress} />

      <p className="panel-description">
        {isMaxRealm
          ? "已至当前版本最高境界。"
          : `距离${nextRealm.name}还需 ${formatNumber(
              Math.max(0, required - save.player.cultivation.currentCultivation)
            )} 修为。`}
      </p>

      <div className="summary-row">
        <StatBlock
          label="当前修为"
          value={`${formatNumber(save.player.cultivation.currentCultivation)} / ${formatNumber(required)}`}
        />
        <StatBlock label="突破所需" value={formatNumber(required)} />
        <StatBlock label="每秒修为" value={`${formatNumber(gainPerSecond)} / 秒`} />
      </div>

      <button
        className="primary-button panel-action"
        disabled={!breakthroughAvailable}
        type="button"
        onClick={() => void breakthroughNow()}
      >
        {isMaxRealm ? "已至当前版本最高境界" : "突破"}
      </button>
    </section>
  );
}

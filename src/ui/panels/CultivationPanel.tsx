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
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
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
    <section className="panel cultivation-panel">
      <div className="panel-heading">
        <span className="eyebrow">Cultivation</span>
        <h2>修为进境</h2>
      </div>

      <div className="cultivation-status-row">
        <strong>
          {isMaxRealm ? "已达最高境界" : breakthroughAvailable ? "可突破" : "修炼中"}
        </strong>
        <span>
          {formatNumber(save.player.cultivation.currentCultivation)} / {formatNumber(required)}
        </span>
      </div>

      <ProgressBar value={Math.min(1, progress)} />

      <div className="cultivation-metrics">
        <StatBlock
          label="还需"
          value={
            isMaxRealm
              ? "0"
              : formatNumber(Math.max(0, required - save.player.cultivation.currentCultivation))
          }
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

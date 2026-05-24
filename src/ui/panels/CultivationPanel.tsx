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

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "可突破";
  }

  if (seconds < 60) {
    return `${Math.ceil(seconds)} 秒`;
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.ceil(seconds % 60);
    return `${minutes} 分 ${remainingSeconds} 秒`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} 时 ${minutes} 分`;
}

export function CultivationPanel({ save }: { save: GameSaveData }) {
  const { breakthroughNow } = useGameStore();
  const required = getCultivationRequired(save);
  const progress = getCultivationProgress(save);
  const gainPerSecond = getCultivationGainPerSecond(save);
  const nextRealm = getNextRealm(save);
  const breakthroughAvailable = canBreakthrough(save);
  const isMaxRealm = nextRealm === null;
  const currentCultivation = save.player.cultivation.currentCultivation;
  const remainingCultivation = Math.max(0, required - currentCultivation);
  const estimatedTime = isMaxRealm ? "暂未开放" : formatDuration(remainingCultivation / gainPerSecond);

  return (
    <section className="panel cultivation-panel">
      <div className="panel-heading">
        <span className="eyebrow">Cultivation</span>
        <h2>修为进境</h2>
      </div>

      <div className="cultivation-status-row">
        <strong className={breakthroughAvailable ? "cultivation-ready" : undefined}>
          {isMaxRealm ? "已达最高境界" : breakthroughAvailable ? "可突破" : "修炼中"}
        </strong>
        <span>
          {isMaxRealm
            ? `当前修为 ${formatNumber(currentCultivation)}`
            : `${formatNumber(currentCultivation)} / ${formatNumber(required)}`}
        </span>
      </div>

      <ProgressBar value={isMaxRealm ? 1 : Math.min(1, progress)} />

      <div className="cultivation-metrics">
        <StatBlock
          label={isMaxRealm ? "下阶" : "还需"}
          value={
            isMaxRealm
              ? "暂未开放"
              : formatNumber(Math.max(0, required - currentCultivation))
          }
        />
        <StatBlock label="突破所需" value={isMaxRealm ? "未开放" : formatNumber(required)} />
        <StatBlock label="每秒修为" value={`${formatNumber(gainPerSecond)} / 秒`} />
        <StatBlock label="预计突破" value={estimatedTime} />
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

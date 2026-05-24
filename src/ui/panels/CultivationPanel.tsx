import type { GameSaveData } from "../../game/types";
import {
  calculateFinalStats,
  getCultivationProgress,
  getCultivationRequired
} from "../../game/core/selectors";
import { ProgressBar } from "../components/ProgressBar";
import { StatBlock } from "../components/StatBlock";

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function CultivationPanel({ save }: { save: GameSaveData }) {
  const required = getCultivationRequired(save);
  const progress = getCultivationProgress(save);
  const finalStats = calculateFinalStats(save);

  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="eyebrow">Cultivation</span>
        <h2>修为进境</h2>
      </div>

      <ProgressBar value={progress} />

      <div className="summary-row">
        <StatBlock label="当前修为" value={formatNumber(save.player.cultivation.currentCultivation)} />
        <StatBlock label="突破所需" value={formatNumber(required)} />
        <StatBlock label="修炼速度" value={`${formatNumber(finalStats.cultivationSpeed)} / 秒`} />
      </div>
    </section>
  );
}

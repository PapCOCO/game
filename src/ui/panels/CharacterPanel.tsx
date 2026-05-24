import type { GameSaveData } from "../../game/types";
import {
  calculateFinalStats,
  getCurrentRealm,
  getPlayerPower
} from "../../game/core/selectors";
import { StatBlock } from "../components/StatBlock";

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function CharacterPanel({ save }: { save: GameSaveData }) {
  const realm = getCurrentRealm(save);
  const finalStats = calculateFinalStats(save);
  const power = getPlayerPower(save);

  return (
    <section className="panel character-panel">
      <div className="panel-heading">
        <span className="eyebrow">Character</span>
        <h2>{save.player.name}</h2>
      </div>

      <div className="summary-row">
        <StatBlock label="境界" value={realm?.name ?? "未知境界"} />
        <StatBlock label="灵石" value={save.player.spiritStones} />
        <StatBlock label="战力" value={formatNumber(power)} />
      </div>

      <div className="stat-grid">
        <StatBlock label="攻击" value={formatNumber(finalStats.attack)} />
        <StatBlock label="防御" value={formatNumber(finalStats.defense)} />
        <StatBlock label="气血" value={formatNumber(finalStats.maxHp)} />
        <StatBlock label="修炼速度" value={formatNumber(finalStats.cultivationSpeed)} />
        <StatBlock label="灵石加成" value={formatPercent(finalStats.spiritStoneBonus)} />
      </div>
    </section>
  );
}

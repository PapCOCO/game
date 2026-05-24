import { useState } from "react";
import type { GameSaveData } from "../../game/types";
import {
  calculateFinalStats,
  getCurrentMap,
  getCurrentRealm,
  getPlayerPower
} from "../../game/core/selectors";
import { StatBlock } from "../components/StatBlock";

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function CharacterPanel({ save }: { save: GameSaveData }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const realm = getCurrentRealm(save);
  const currentMap = getCurrentMap(save);
  const finalStats = calculateFinalStats(save);
  const power = getPlayerPower(save);

  return (
    <section className="panel character-panel compact-character-panel">
      <div className="compact-panel-heading">
        <div>
          <span className="eyebrow">Character</span>
          <h2>{save.player.name}</h2>
        </div>
        <button
          className="secondary-button compact-button"
          type="button"
          onClick={() => setIsDetailOpen(true)}
        >
          详情
        </button>
      </div>

      <div className="compact-character-summary">
        <StatBlock label="境界" value={realm?.name ?? "未知"} />
        <StatBlock label="战力" value={formatNumber(power)} />
        <StatBlock label="灵石" value={save.player.spiritStones} />
      </div>

      <div className="compact-stat-row">
        <span>攻 {formatNumber(finalStats.attack)}</span>
        <span>防 {formatNumber(finalStats.defense)}</span>
        <span>血 {formatNumber(finalStats.maxHp)}</span>
        <span>速 {formatNumber(finalStats.speed)}</span>
      </div>

      {isDetailOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="detail-modal" role="dialog" aria-modal="true" aria-label="角色详情">
            <div className="escape-menu-header">
              <div>
                <span className="eyebrow">Details</span>
                <h2>角色详情</h2>
              </div>
              <button
                className="secondary-button compact-button"
                type="button"
                onClick={() => setIsDetailOpen(false)}
              >
                关闭
              </button>
            </div>

            <div className="detail-stat-grid">
              <StatBlock label="攻击" value={formatNumber(finalStats.attack)} />
              <StatBlock label="防御" value={formatNumber(finalStats.defense)} />
              <StatBlock label="气血" value={formatNumber(finalStats.maxHp)} />
              <StatBlock label="速度" value={formatNumber(finalStats.speed)} />
              <StatBlock label="修炼速度" value={formatNumber(finalStats.cultivationSpeed)} />
              <StatBlock label="灵石收益" value={formatPercent(finalStats.spiritStoneBonus)} />
              <StatBlock label="当前境界" value={realm?.name ?? save.player.realmId} />
              <StatBlock label="当前地图" value={currentMap?.name ?? save.map.currentMapId} />
              <StatBlock label="击杀数量" value={save.autoBattle.defeatedCount} />
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

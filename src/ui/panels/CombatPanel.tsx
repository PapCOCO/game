import type { GameSaveData } from "../../game/types";
import { MONSTERS } from "../../game/config";
import { getCurrentMap } from "../../game/core/selectors";
import { LogPanel } from "../components/LogPanel";

export function CombatPanel({ save }: { save: GameSaveData }) {
  const currentMap = getCurrentMap(save);
  const combatLogs = save.logs.entries.filter(
    (log) => log.type === "battle" || log.type === "drop"
  );
  const latestBattleLog = combatLogs.find((log) => log.type === "battle");

  return (
    <section className="panel combat-panel">
      <div className="panel-heading">
        <span className="eyebrow">Combat</span>
        <h2>自动历练</h2>
      </div>

      <div className="summary-row">
        <div className="stat-block">
          <span className="stat-label">当前地图</span>
          <strong className="stat-value">{currentMap?.name ?? "未知地图"}</strong>
        </div>
        <div className="stat-block">
          <span className="stat-label">自动战斗</span>
          <strong className="stat-value">{save.autoBattle.enabled ? "开启" : "关闭"}</strong>
        </div>
        <div className="stat-block">
          <span className="stat-label">已击败</span>
          <strong className="stat-value">{save.autoBattle.defeatedCount}</strong>
        </div>
      </div>

      <div className="combat-section">
        <h3>怪物池</h3>
        {currentMap === undefined ? (
          <p className="muted-text">当前地图不存在。</p>
        ) : (
          <div className="monster-pool">
            {currentMap.monsterPool.map((entry) => {
              const monster = MONSTERS.find((item) => item.id === entry.value);

              return (
                <div className="monster-row" key={entry.value}>
                  <span>{monster?.name ?? entry.value}</span>
                  <small>权重 {entry.weight}</small>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="combat-section">
        <h3>最近战斗</h3>
        <p className="panel-description">
          {latestBattleLog?.message ?? "尚未开始历练。"}
        </p>
      </div>

      <LogPanel logs={combatLogs} emptyText="尚未开始历练。" />
    </section>
  );
}

import type { GameSaveData } from "../../game/types";
import { getCurrentMap } from "../../game/core/selectors";
import { LogPanel } from "../components/LogPanel";

export function CombatPanel({ save }: { save: GameSaveData }) {
  const currentMap = getCurrentMap(save);
  const combatLogs = save.logs.entries.filter(
    (log) => log.type === "battle" || log.type === "drop"
  );

  return (
    <section className="panel">
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

      <LogPanel logs={combatLogs} emptyText="尚未开始历练。" />
    </section>
  );
}

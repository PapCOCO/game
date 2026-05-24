import type { GameSaveData } from "../../game/types";
import { MONSTERS } from "../../game/config";
import { calculateCombatPower, getActionGainPerSecond } from "../../game/core/combat";
import { calculateFinalStats, getCurrentMap } from "../../game/core/selectors";
import { useGameStore } from "../../game/state/gameStore";
import { ProgressBar } from "../components/ProgressBar";

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "即将出手";
  }

  return `${seconds.toFixed(1)} 秒`;
}

function getTimeToAct(progress: number, gainPerSecond: number): string {
  return formatSeconds((100 - Math.min(100, progress)) / Math.max(1, gainPerSecond));
}

const COMBAT_EVENT_LABELS: Record<string, string> = {
  "player-hit": "玩家攻击",
  "enemy-hit": "敌人攻击",
  victory: "击败敌人",
  loot: "获得掉落",
  recover: "调息恢复",
  system: "状态"
};

export function CombatPanel({ save }: { save: GameSaveData }) {
  const { toggleAutoBattleNow } = useGameStore();
  const currentMap = getCurrentMap(save);
  const playerStats = calculateFinalStats(save);
  const playerMaxHp = Math.max(1, playerStats.maxHp);
  const playerCurrentHp = Math.min(save.autoBattle.playerCurrentHp ?? playerMaxHp, playerMaxHp);
  const playerActionProgress = Math.min(100, save.autoBattle.playerActionProgress ?? 0);
  const enemy = save.autoBattle.currentEnemy;
  const monster = enemy === undefined ? undefined : MONSTERS.find((item) => item.id === enemy.monsterId);
  const enemyActionProgress = Math.min(100, save.autoBattle.enemyActionProgress ?? 0);
  const recoveringUntil = save.autoBattle.recoveringUntil;
  const now = Date.now();
  const isRecovering = recoveringUntil !== undefined && recoveringUntil > now;
  const playerActionGain = getActionGainPerSecond(playerStats.speed);
  const enemyActionGain = monster === undefined ? 0 : getActionGainPerSecond(monster.stats.speed);
  const recentEvents = save.autoBattle.recentEvents ?? [];
  const recentDamage = recentEvents.find(
    (event) => event.type === "player-hit" || event.type === "enemy-hit"
  );
  const combatStatus = !save.autoBattle.enabled
    ? "自动历练暂停"
    : isRecovering
      ? "调息恢复"
      : enemy === undefined || monster === undefined
        ? "寻敌中"
        : "战斗中";

  return (
    <section className="panel combat-panel">
      <div className="panel-heading combat-heading">
        <div>
          <span className="eyebrow">Combat</span>
          <h2>自动历练</h2>
        </div>
        <button
          className={save.autoBattle.enabled ? "secondary-button compact-button" : "primary-button compact-button"}
          type="button"
          onClick={() => void toggleAutoBattleNow()}
        >
          {save.autoBattle.enabled ? "暂停历练" : "开始历练"}
        </button>
      </div>

      <div className="combat-status-grid">
        <div className="combat-card">
          <span className="stat-label">状态</span>
          <strong>{combatStatus}</strong>
        </div>
        <div className="combat-card">
          <span className="stat-label">地图</span>
          <strong>{currentMap?.name ?? "未知地图"}</strong>
        </div>
        <div className="combat-card">
          <span className="stat-label">最近伤害</span>
          <strong>{recentDamage?.message ?? "暂无交锋"}</strong>
        </div>
      </div>

      <div className="combat-state-banner">
        <strong>{combatStatus}</strong>
        <span>累计击败 {save.autoBattle.defeatedCount} 只怪物</span>
      </div>

      <div className="combat-duel">
        <div className="combatant-card">
          <div className="combatant-header">
            <h3>{save.player.name}</h3>
            <small>{isRecovering ? "调息恢复中" : "战斗中"}</small>
          </div>
          <ProgressBar value={playerCurrentHp / playerMaxHp} />
          <div className="action-progress">
            <div className="combatant-meta">
              <span>行动</span>
              <span>{formatNumber(playerActionProgress)}%</span>
            </div>
            <ProgressBar value={playerActionProgress / 100} />
          </div>
          <div className="combatant-meta">
            <span>
              气血 {formatNumber(playerCurrentHp)} / {formatNumber(playerMaxHp)}
            </span>
            <span>
              速 {formatNumber(playerStats.speed)} · 战力 {formatNumber(calculateCombatPower(playerStats))}
            </span>
          </div>
          <div className="combatant-meta">
            <span>行动速度 {formatNumber(playerActionGain)} / 秒</span>
            <span>预计出手 {getTimeToAct(playerActionProgress, playerActionGain)}</span>
          </div>
          <div className="combatant-meta">
            <span>行动周期 {(100 / playerActionGain).toFixed(1)} 秒</span>
          </div>
        </div>

        <div className="combatant-card">
          <div className="combatant-header">
            <h3>{monster?.name ?? "正在寻找敌人"}</h3>
            <small>{monster === undefined ? "待遭遇" : `Lv.${monster.level}`}</small>
          </div>
          <ProgressBar value={enemy === undefined ? 0 : enemy.currentHp / enemy.maxHp} />
          <div className="action-progress">
            <div className="combatant-meta">
              <span>行动</span>
              <span>{monster === undefined ? "0%" : `${formatNumber(enemyActionProgress)}%`}</span>
            </div>
            <ProgressBar value={monster === undefined ? 0 : enemyActionProgress / 100} />
          </div>
          <div className="combatant-meta">
            {enemy === undefined || monster === undefined ? (
              <span>暂无敌人状态。</span>
            ) : (
              <>
                <span>
                  气血 {formatNumber(enemy.currentHp)} / {formatNumber(enemy.maxHp)}
                </span>
                <span>
                  攻 {formatNumber(monster.stats.attack)} · 防 {formatNumber(monster.stats.defense)} · 速{" "}
                  {formatNumber(monster.stats.speed)}
                </span>
              </>
            )}
          </div>
          <div className="combatant-meta">
            {monster === undefined ? (
              <span>等待遭遇后显示速度与出手时间。</span>
            ) : (
              <>
                <span>行动速度 {formatNumber(enemyActionGain)} / 秒</span>
                <span>预计出手 {getTimeToAct(enemyActionProgress, enemyActionGain)}</span>
              </>
            )}
          </div>
          {monster !== undefined ? (
            <div className="combatant-meta">
              <span>行动周期 {(100 / Math.max(1, enemyActionGain)).toFixed(1)} 秒</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="combat-section monster-pool-section">
        <h3>怪物池</h3>
        {currentMap === undefined ? (
          <p className="muted-text">当前地图不存在。</p>
        ) : (
          <div className="monster-pool compact-monster-pool">
            {currentMap.monsterPool.map((entry) => {
              const poolMonster = MONSTERS.find((item) => item.id === entry.value);

              return (
                <div className="monster-row" key={entry.value}>
                  <span>{poolMonster?.name ?? entry.value}</span>
                  <small>{entry.weight}</small>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="combat-log-wrap">
        <h3>近期战况</h3>
        <div className="combat-event-list">
          {recentEvents.length === 0 ? (
            <p className="muted-text">尚未开始交锋。</p>
          ) : (
            recentEvents.slice(0, 5).map((event) => (
              <div className={`combat-event combat-event-${event.type}`} key={event.id}>
                <span>{COMBAT_EVENT_LABELS[event.type] ?? event.type}</span>
                <p>{event.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

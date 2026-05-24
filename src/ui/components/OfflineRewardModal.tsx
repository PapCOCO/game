import type { OfflineRewardSummary } from "../../game/types";
import { ITEMS } from "../../game/config";

interface OfflineRewardModalProps {
  summary: OfflineRewardSummary;
  onDismiss: () => void;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}小时${remainingMinutes}分钟`;
  }

  return `${minutes}分钟`;
}

export function OfflineRewardModal({ summary, onDismiss }: OfflineRewardModalProps) {
  const hasAnyReward =
    summary.cultivationGained > 0 ||
    summary.spiritStonesGained > 0 ||
    summary.itemsGained.length > 0 ||
    summary.equipmentGained.length > 0;

  return (
    <div className="modal-backdrop" onClick={onDismiss}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="escape-menu-header">
          <div>
            <p className="eyebrow">离线收益</p>
            <h2>闭关结束</h2>
          </div>
        </div>

        <div className="escape-menu-section">
          <p className="panel-description">
            离线时长：{formatDuration(summary.offlineDurationMs)}
            {summary.cappedDurationMs < summary.offlineDurationMs && (
              <span>（已上限，实际结算{formatDuration(summary.cappedDurationMs)}）</span>
            )}
          </p>
        </div>

        {!hasAnyReward ? (
          <div className="escape-menu-section">
            <p>本次离线未获得收益。</p>
          </div>
        ) : (
          <div className="escape-menu-section">
            <div className="menu-stat-list">
              {summary.cultivationGained > 0 && (
                <div>
                  <dt>修为</dt>
                  <dd>+{summary.cultivationGained}</dd>
                </div>
              )}
              {summary.spiritStonesGained > 0 && (
                <div>
                  <dt>灵石</dt>
                  <dd>+{summary.spiritStonesGained}</dd>
                </div>
              )}
              {summary.itemsGained.map((item) => {
                const itemDef = ITEMS.find((def) => def.id === item.itemId);
                return (
                  <div key={item.itemId}>
                    <dt>{itemDef?.name ?? item.itemId}</dt>
                    <dd>+{item.quantity}</dd>
                  </div>
                );
              })}
              {summary.equipmentGained.length > 0 && (
                <div>
                  <dt>装备</dt>
                  <dd>+{summary.equipmentGained.length}件</dd>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="menu-action-list">
          <button className="primary-button panel-action" onClick={onDismiss}>
            继续修炼
          </button>
        </div>
      </div>
    </div>
  );
}

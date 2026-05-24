import { useEffect } from "react";
import {
  calculateFinalStats,
  getCurrentMap,
  getCurrentRealm,
  getPlayerPower
} from "../../game/core/selectors";
import { useGameStore } from "../../game/state/gameStore";

interface EscapeMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleOpen: () => void;
}

export function EscapeMenu({ isOpen, onClose, onToggleOpen }: EscapeMenuProps) {
  const { save, saveNow, toggleAutoBattleNow } = useGameStore();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      onToggleOpen();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onToggleOpen]);

  if (!isOpen || save === null) {
    return null;
  }

  const realm = getCurrentRealm(save);
  const currentMap = getCurrentMap(save);
  const finalStats = calculateFinalStats(save);
  const power = getPlayerPower(save);

  return (
    <div className="escape-menu-backdrop" role="presentation">
      <section className="escape-menu" role="dialog" aria-modal="true" aria-label="游戏菜单">
        <div className="escape-menu-header">
          <div>
            <span className="eyebrow">Menu</span>
            <h2>游戏菜单</h2>
          </div>
          <button className="secondary-button compact-button" type="button" onClick={onClose}>
            继续游戏
          </button>
        </div>

        <div className="escape-menu-grid">
          <div className="escape-menu-section">
            <h3>角色</h3>
            <dl className="menu-stat-list">
              <div>
                <dt>角色名</dt>
                <dd>{save.player.name}</dd>
              </div>
              <div>
                <dt>境界</dt>
                <dd>{realm?.name ?? save.player.realmId}</dd>
              </div>
              <div>
                <dt>地图</dt>
                <dd>{currentMap?.name ?? save.map.currentMapId}</dd>
              </div>
              <div>
                <dt>灵石</dt>
                <dd>{save.player.spiritStones}</dd>
              </div>
              <div>
                <dt>战力</dt>
                <dd>{power.toFixed(1)}</dd>
              </div>
              <div>
                <dt>攻击</dt>
                <dd>{finalStats.attack.toFixed(1)}</dd>
              </div>
              <div>
                <dt>防御</dt>
                <dd>{finalStats.defense.toFixed(1)}</dd>
              </div>
              <div>
                <dt>气血</dt>
                <dd>{finalStats.maxHp.toFixed(1)}</dd>
              </div>
              <div>
                <dt>速度</dt>
                <dd>{finalStats.speed.toFixed(1)}</dd>
              </div>
              <div>
                <dt>自动保存</dt>
                <dd>{save.settings.autoSaveEnabled ? "开启" : "关闭"}</dd>
              </div>
              <div>
                <dt>自动历练</dt>
                <dd>{save.autoBattle.enabled ? "开启" : "暂停"}</dd>
              </div>
            </dl>
          </div>

          <div className="escape-menu-section">
            <h3>操作</h3>
            <div className="menu-action-list">
              <button className="primary-button" type="button" onClick={onClose}>
                继续游戏
              </button>
              <button className="secondary-button" type="button" onClick={() => void saveNow()}>
                手动保存
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => void toggleAutoBattleNow()}
              >
                {save.autoBattle.enabled ? "暂停自动历练" : "开始自动历练"}
              </button>
              <button className="secondary-button" disabled type="button">
                游戏说明
              </button>
              <button className="secondary-button" disabled type="button">
                设置
              </button>
              <button className="secondary-button" disabled type="button">
                返回标题界面
              </button>
              <button className="secondary-button" disabled type="button">
                退出游戏
              </button>
            </div>
          </div>

          <div className="escape-menu-section">
            <h3>游戏说明</h3>
            <ul className="menu-copy-list">
              <li>修炼会自动增长修为。</li>
              <li>修为达到要求后可以突破境界。</li>
              <li>当前地图会自动遭遇敌人并掉落材料与装备。</li>
              <li>装备可穿戴到对应部位，并提升属性与战斗表现。</li>
            </ul>
          </div>

          <div className="escape-menu-section">
            <h3>设置</h3>
            <ul className="menu-copy-list">
              <li>音量：后续开放。</li>
              <li>字体大小：后续开放。</li>
              <li>主题：后续开放。</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

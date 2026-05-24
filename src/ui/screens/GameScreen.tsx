import { useCallback, useState } from "react";
import { useGameStore } from "../../game/state/gameStore";
import { getCurrentMap, getCurrentRealm, getPlayerPower } from "../../game/core/selectors";
import { canBreakthrough } from "../../game/core/cultivation";
import { getNextRealm } from "../../game/core/breakthrough";
import { CharacterPanel } from "../panels/CharacterPanel";
import { CombatPanel } from "../panels/CombatPanel";
import { CultivationPanel } from "../panels/CultivationPanel";
import { EquipmentPanel } from "../panels/EquipmentPanel";
import { InventoryPanel } from "../panels/InventoryPanel";
import { MapPanel } from "../panels/MapPanel";
import { MarketPanel } from "../panels/MarketPanel";
import { EstatePanel } from "../panels/EstatePanel";
import { ObjectivePanel } from "../panels/ObjectivePanel";
import { EscapeMenu } from "../components/EscapeMenu";

import { useAutoSave } from "../hooks/useAutoSave";
import { useGameLoop } from "../hooks/useGameLoop";

type RightPanelTab = "inventory" | "market" | "estate";

export function GameScreen() {
  const { breakthroughNow, noticeMessage, save, saveNow, toggleAutoBattleNow } = useGameStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [rightTab, setRightTab] = useState<RightPanelTab>("inventory");

  useGameLoop();
  useAutoSave();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((current) => !current);
  }, []);

  if (save === null) {
    return null;
  }

  const currentRealm = getCurrentRealm(save);
  const currentMap = getCurrentMap(save);
  const playerPower = getPlayerPower(save);
  const nextRealm = getNextRealm(save);
  const breakthroughReady = canBreakthrough(save);

  async function handleSaveNow() {
    setIsSaving(true);

    try {
      await saveNow();
    } catch {
      // saveNow reports errors through the shared game store.
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="app-shell game-shell">
      <header className="game-topbar">
        <div className="topbar-title">
          <h1>修仙挂机录</h1>
          <span>存档 {save.meta.slotId}</span>
        </div>

        <div className="topbar-meta" aria-label="角色概要">
          <div className="topbar-stat">
            <span>角色</span>
            <strong>{save.player.name}</strong>
          </div>
          <div className="topbar-stat">
            <span>境界</span>
            <strong>{currentRealm?.name ?? save.player.realmId}</strong>
          </div>
          <div className="topbar-stat">
            <span>灵石</span>
            <strong>{save.player.spiritStones}</strong>
          </div>
          <div className="topbar-stat">
            <span>战力</span>
            <strong>{playerPower.toFixed(1)}</strong>
          </div>
          <div className="topbar-stat">
            <span>地图</span>
            <strong>{currentMap?.name ?? save.map.currentMapId}</strong>
          </div>
          <div className="topbar-stat">
            <span>历练</span>
            <strong>{save.autoBattle.enabled ? "开启" : "暂停"}</strong>
          </div>
        </div>
      </header>

      <div className="game-main">
        <aside className="game-column left-column">
          <CharacterPanel save={save} />
          <CultivationPanel save={save} />
          <MapPanel save={save} />
        </aside>

        <section className="game-column center-column" aria-label="主文本区域">
          <CombatPanel save={save} />
          <ObjectivePanel save={save} />
        </section>

        <aside className="game-column right-column">
          <div className="right-column-inner">
            <div className="right-panel-tabs" role="tablist" aria-label="右侧面板">
              <button
                className={rightTab === "inventory" ? "tab-button tab-button-active" : "tab-button"}
                type="button"
                onClick={() => setRightTab("inventory")}
              >
                装备行囊
              </button>
              <button
                className={rightTab === "market" ? "tab-button tab-button-active" : "tab-button"}
                type="button"
                onClick={() => setRightTab("market")}
              >
                坊市
              </button>
              <button
                className={rightTab === "estate" ? "tab-button tab-button-active" : "tab-button"}
                type="button"
                onClick={() => setRightTab("estate")}
              >
                洞府
              </button>
            </div>
            <div className="right-panel-content">
              {rightTab === "inventory" ? (
                <>
                  <EquipmentPanel save={save} />
                  <InventoryPanel save={save} />
                </>
              ) : rightTab === "market" ? (
                <MarketPanel save={save} />
              ) : (
                <EstatePanel save={save} />
              )}
            </div>
          </div>
        </aside>
      </div>

      <footer className="action-bar">
        <p>{noticeMessage ?? "山中无岁月，灵气自周天缓缓流转。"}</p>
        <div className="action-buttons">
          <button
            className="primary-button"
            disabled={!breakthroughReady}
            type="button"
            onClick={() => void breakthroughNow()}
          >
            {nextRealm === null ? "已至顶峰" : "突破"}
          </button>
          <button className="secondary-button" type="button" onClick={() => void toggleAutoBattleNow()}>
            {save.autoBattle.enabled ? "暂停历练" : "继续历练"}
          </button>
          <button className="secondary-button" disabled={isSaving} type="button" onClick={handleSaveNow}>
            {isSaving ? "保存中..." : "存档"}
          </button>
          <button className="secondary-button" type="button" onClick={toggleMenu}>
            菜单 / Esc
          </button>
        </div>
      </footer>

      <EscapeMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onToggleOpen={toggleMenu}
      />
    </main>
  );
}

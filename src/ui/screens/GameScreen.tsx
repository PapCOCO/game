import { useState } from "react";
import { useGameStore } from "../../game/state/gameStore";
import { getCurrentRealm } from "../../game/core/selectors";
import { CharacterPanel } from "../panels/CharacterPanel";
import { CombatPanel } from "../panels/CombatPanel";
import { CultivationPanel } from "../panels/CultivationPanel";
import { EquipmentPanel } from "../panels/EquipmentPanel";
import { InventoryPanel } from "../panels/InventoryPanel";
import { MapPanel } from "../panels/MapPanel";
import { LogPanel } from "../components/LogPanel";
import { useAutoSave } from "../hooks/useAutoSave";
import { useGameLoop } from "../hooks/useGameLoop";

export function GameScreen() {
  const { noticeMessage, save, saveNow } = useGameStore();
  const [isSaving, setIsSaving] = useState(false);

  useGameLoop();
  useAutoSave();

  if (save === null) {
    return null;
  }

  const currentRealm = getCurrentRealm(save);

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
      <header className="game-header">
        <div className="topbar-title">
          <p className="eyebrow">Single Player Idle</p>
          <h1>修仙挂机 MVP Plus</h1>
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
        </div>

        <div className="save-controls">
          {noticeMessage !== undefined ? <span>{noticeMessage}</span> : null}
          <button className="secondary-button" disabled={isSaving} type="button" onClick={handleSaveNow}>
            {isSaving ? "保存中..." : "手动保存"}
          </button>
        </div>
      </header>

      <div className="desktop-layout">
        <div className="game-column left-column">
          <CharacterPanel save={save} />
          <CultivationPanel save={save} />
          <MapPanel save={save} />
        </div>

        <div className="game-column center-column">
          <CombatPanel save={save} />
          <section className="panel log-panel">
            <div className="panel-heading">
              <span className="eyebrow">Log</span>
              <h2>历程</h2>
            </div>
            <LogPanel logs={save.logs.entries} />
          </section>
        </div>

        <div className="game-column right-column">
          <EquipmentPanel save={save} />
          <InventoryPanel save={save} />
        </div>
      </div>
    </main>
  );
}

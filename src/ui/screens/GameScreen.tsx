import { useState } from "react";
import { useGameStore } from "../../game/state/gameStore";
import { CharacterPanel } from "../panels/CharacterPanel";
import { CultivationPanel } from "../panels/CultivationPanel";
import { MapPanel } from "../panels/MapPanel";
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
        <div>
          <p className="eyebrow">Single Player Idle</p>
          <h1>修仙挂机 MVP Plus</h1>
        </div>

        <div className="save-controls">
          {noticeMessage !== undefined ? <span>{noticeMessage}</span> : null}
          <button className="secondary-button" disabled={isSaving} type="button" onClick={handleSaveNow}>
            {isSaving ? "保存中..." : "手动保存"}
          </button>
        </div>
      </header>

      <div className="game-grid">
        <CharacterPanel save={save} />
        <CultivationPanel save={save} />
        <MapPanel save={save} />
      </div>
    </main>
  );
}

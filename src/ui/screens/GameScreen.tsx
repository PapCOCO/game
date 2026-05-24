import { useState } from "react";
import { useGameStore } from "../../game/state/gameStore";
import { CharacterPanel } from "../panels/CharacterPanel";
import { CultivationPanel } from "../panels/CultivationPanel";
import { MapPanel } from "../panels/MapPanel";

export function GameScreen() {
  const { save, saveNow } = useGameStore();
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (save === null) {
    return null;
  }

  async function handleSaveNow() {
    setIsSaving(true);
    setSaveMessage("");

    try {
      await saveNow();
      setSaveMessage("已保存。");
    } catch {
      setSaveMessage("保存失败。");
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
          {saveMessage !== "" ? <span>{saveMessage}</span> : null}
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

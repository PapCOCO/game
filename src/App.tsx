import { useEffect } from "react";
import { GameProvider, useGameStore } from "./game/state/gameStore";
import { CreateCharacterScreen } from "./ui/screens/CreateCharacterScreen";
import { GameScreen } from "./ui/screens/GameScreen";

function AppContent() {
  const { errorMessage, loadSave, status } = useGameStore();

  useEffect(() => {
    void loadSave();
  }, [loadSave]);

  if (status === "loading") {
    return (
      <main className="app-shell centered-shell">
        <section className="status-card">
          <p className="eyebrow">Loading</p>
          <h1>修仙挂机 MVP Plus</h1>
          <div className="status-panel">
            <span className="status-dot status-loading" />
            <span>正在读取存档...</span>
          </div>
        </section>
      </main>
    );
  }

  if (status === "no-save") {
    return <CreateCharacterScreen />;
  }

  if (status === "ready") {
    return <GameScreen />;
  }

  return (
    <main className="app-shell centered-shell">
      <section className="status-card">
        <p className="eyebrow">Error</p>
        <h1>读取存档失败</h1>
        <p className="description">{errorMessage ?? "未知错误"}</p>
        <button className="primary-button" type="button" onClick={() => void loadSave()}>
          重试
        </button>
      </section>
    </main>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;

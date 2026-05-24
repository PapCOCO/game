import { useEffect } from "react";
import { useGameStore } from "../../game/state/gameStore";

export function useAutoSave() {
  const { save, saveNow, status } = useGameStore();
  const autoSaveEnabled = save?.settings.autoSaveEnabled ?? false;
  const autoSaveIntervalMs = save?.settings.autoSaveIntervalMs ?? 10000;
  const hasSave = save !== null;

  useEffect(() => {
    if (status !== "ready" || !hasSave || !autoSaveEnabled) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      void saveNow();
    }, autoSaveIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoSaveEnabled, autoSaveIntervalMs, hasSave, saveNow, status]);
}

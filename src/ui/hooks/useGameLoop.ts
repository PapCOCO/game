import { useEffect } from "react";
import { useGameStore } from "../../game/state/gameStore";

export function useGameLoop() {
  const { save, status, tick } = useGameStore();
  const hasSave = save !== null;

  useEffect(() => {
    if (status !== "ready" || !hasSave) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      tick();
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [hasSave, status, tick]);
}

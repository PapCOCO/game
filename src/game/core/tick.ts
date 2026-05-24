import type { GameSaveData } from "../types";
import { applyCultivationGain } from "./cultivation";

const MAX_TICK_SECONDS = 10;

export function tickGame(save: GameSaveData, now = Date.now()): GameSaveData {
  const elapsedMs = now - save.runtime.time.lastActiveAt;

  if (elapsedMs <= 0) {
    return save;
  }

  const elapsedSeconds = Math.min(elapsedMs / 1000, MAX_TICK_SECONDS);

  return applyCultivationGain(save, elapsedSeconds, now);
}

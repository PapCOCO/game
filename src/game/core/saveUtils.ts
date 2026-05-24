import type { GameLogEntry, GameLogType, GameSaveData } from "../types";
import { createId } from "./random";

export function appendLog(
  save: GameSaveData,
  type: GameLogType,
  message: string,
  now = Date.now(),
  payload?: Record<string, unknown>
): GameSaveData {
  const entry: GameLogEntry = {
    id: createId("log"),
    type,
    message,
    createdAt: now,
    payload
  };

  return {
    ...save,
    logs: {
      ...save.logs,
      entries: [entry, ...save.logs.entries].slice(0, save.logs.maxEntries)
    }
  };
}

export function touchSave(save: GameSaveData, now = Date.now()): GameSaveData {
  return {
    ...save,
    meta: {
      ...save.meta,
      updatedAt: now
    },
    runtime: {
      ...save.runtime,
      time: {
        ...save.runtime.time,
        updatedAt: now,
        lastActiveAt: now
      }
    }
  };
}

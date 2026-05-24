import type { GameSaveData } from "../types";
import { migrateSaveData } from "./migrateSave";

export function serializeSaveData(save: GameSaveData): string {
  return JSON.stringify(save);
}

export function deserializeSaveData(raw: string): GameSaveData | null {
  try {
    return migrateSaveData(JSON.parse(raw));
  } catch {
    return null;
  }
}

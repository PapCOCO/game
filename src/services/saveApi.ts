import type { GameSaveData } from "../game/types";
import { deserializeSaveData, serializeSaveData } from "../game/save/serializeSave";

export async function loadGameSave(): Promise<GameSaveData | null> {
  const result = await window.gameAPI.loadSave();

  if (!result.ok) {
    throw new Error(result.error);
  }

  if (result.data === null) {
    return null;
  }

  const raw = JSON.stringify(result.data);

  if (raw === undefined) {
    return null;
  }

  return deserializeSaveData(raw);
}

export async function saveGameSave(save: GameSaveData): Promise<void> {
  const result = await window.gameAPI.writeSave(JSON.parse(serializeSaveData(save)));

  if (!result.ok) {
    throw new Error(result.error);
  }
}

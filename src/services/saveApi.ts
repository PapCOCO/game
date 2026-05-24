import type { GameSaveData } from "../game/types";
import { deserializeSaveData, serializeSaveData } from "../game/save/serializeSave";

const SAVE_KEY = "cultivation-idle-save";

export async function loadGameSave(): Promise<GameSaveData | null> {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return null;
    }
    return deserializeSaveData(raw);
  } catch (error) {
    throw new Error("加载存档失败");
  }
}

export async function saveGameSave(save: GameSaveData): Promise<void> {
  try {
    localStorage.setItem(SAVE_KEY, serializeSaveData(save));
  } catch (error) {
    throw new Error("保存存档失败");
  }
}

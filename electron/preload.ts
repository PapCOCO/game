import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "./ipcChannels.js";

type LoadSaveResult =
  | {
      ok: true;
      data: unknown | null;
    }
  | {
      ok: false;
      error: string;
    };

type WriteSaveResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

const gameAPI = {
  loadSave: (): Promise<LoadSaveResult> => {
    return ipcRenderer.invoke(IPC_CHANNELS.LOAD_SAVE);
  },

  writeSave: (saveData: unknown): Promise<WriteSaveResult> => {
    return ipcRenderer.invoke(IPC_CHANNELS.WRITE_SAVE, saveData);
  },

  quitGame: (): Promise<{ ok: boolean }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.QUIT_GAME);
  }
};

contextBridge.exposeInMainWorld("gameAPI", gameAPI);

declare global {
  interface Window {
    gameAPI: typeof gameAPI;
  }
}

/// <reference types="vite/client" />

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

interface GameAPI {
  loadSave: () => Promise<LoadSaveResult>;
  writeSave: (saveData: unknown) => Promise<WriteSaveResult>;
}

interface Window {
  gameAPI: GameAPI;
}

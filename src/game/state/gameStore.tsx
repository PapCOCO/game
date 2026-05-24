import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState
} from "react";
import type { GameSaveData } from "../types";
import { createNewGame } from "../core/createNewGame";
import { loadGameSave, saveGameSave } from "../../services/saveApi";

export type GameStoreStatus = "loading" | "no-save" | "ready" | "error";

interface GameStoreState {
  save: GameSaveData | null;
  status: GameStoreStatus;
  errorMessage?: string;
}

interface GameStoreValue extends GameStoreState {
  loadSave: () => Promise<void>;
  createCharacter: (name: string) => Promise<void>;
  saveNow: () => Promise<void>;
  clearError: () => void;
}

const GameStoreContext = createContext<GameStoreValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameStoreState>({
    save: null,
    status: "loading"
  });

  const loadSave = useCallback(async () => {
    setState((current) => ({
      save: current.save,
      status: "loading"
    }));

    try {
      const loadedSave = await loadGameSave();

      setState({
        save: loadedSave,
        status: loadedSave === null ? "no-save" : "ready"
      });
    } catch (error) {
      setState({
        save: null,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "读取存档失败"
      });
    }
  }, []);

  const createCharacter = useCallback(async (name: string) => {
    const save = createNewGame(name);

    try {
      await saveGameSave(save);

      setState({
        save,
        status: "ready"
      });
    } catch (error) {
      setState({
        save: null,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "创建角色失败"
      });
    }
  }, []);

  const saveNow = useCallback(async () => {
    if (state.save === null) {
      setState({
        save: null,
        status: "error",
        errorMessage: "当前没有可保存的存档"
      });
      return;
    }

    try {
      await saveGameSave(state.save);

      setState({
        save: state.save,
        status: "ready"
      });
    } catch (error) {
      setState({
        save: state.save,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "保存失败"
      });
    }
  }, [state.save]);

  const clearError = useCallback(() => {
    setState((current) => ({
      save: current.save,
      status: current.save === null ? "no-save" : "ready"
    }));
  }, []);

  const value = useMemo<GameStoreValue>(
    () => ({
      ...state,
      loadSave,
      createCharacter,
      saveNow,
      clearError
    }),
    [clearError, createCharacter, loadSave, saveNow, state]
  );

  return <GameStoreContext.Provider value={value}>{children}</GameStoreContext.Provider>;
}

export function useGameStore(): GameStoreValue {
  const context = useContext(GameStoreContext);

  if (context === null) {
    throw new Error("useGameStore must be used within GameProvider.");
  }

  return context;
}

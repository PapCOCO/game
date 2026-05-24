import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type { GameLogEntry, GameSaveData } from "../types";
import { createNewGame } from "../core/createNewGame";
import { breakthrough } from "../core/breakthrough";
import { tickGame } from "../core/tick";
import { isMapUnlocked } from "../core/mapUnlock";
import { MAPS } from "../config";
import { createId } from "../core/random";
import { loadGameSave, saveGameSave } from "../../services/saveApi";

export type GameStoreStatus = "loading" | "no-save" | "ready" | "error";

interface GameStoreState {
  save: GameSaveData | null;
  status: GameStoreStatus;
  errorMessage?: string;
  noticeMessage?: string;
}

interface GameStoreValue extends GameStoreState {
  loadSave: () => Promise<void>;
  createCharacter: (name: string) => Promise<void>;
  saveNow: () => Promise<void>;
  tick: () => void;
  breakthroughNow: () => Promise<void>;
  changeMap: (mapId: string) => Promise<void>;
  clearError: () => void;
}

const GameStoreContext = createContext<GameStoreValue | null>(null);

function appendSystemLog(save: GameSaveData, message: string, now: number): GameSaveData {
  const entry: GameLogEntry = {
    id: createId("log"),
    type: "system",
    message,
    createdAt: now
  };

  return {
    ...save,
    logs: {
      ...save.logs,
      entries: [entry, ...save.logs.entries].slice(0, save.logs.maxEntries)
    }
  };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameStoreState>({
    save: null,
    status: "loading"
  });
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const loadSave = useCallback(async () => {
    setState((current) => ({
      save: current.save,
      status: "loading",
      noticeMessage: current.noticeMessage
    }));

    try {
      const loadedSave = await loadGameSave();

      setState({
        save: loadedSave,
        status: loadedSave === null ? "no-save" : "ready",
        noticeMessage: loadedSave === null ? undefined : "已读取本地存档。"
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
        status: "ready",
        noticeMessage: "角色创建完成。"
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
    const currentState = stateRef.current;

    if (currentState.save === null) {
      setState({
        save: null,
        status: "error",
        errorMessage: "当前没有可保存的存档"
      });
      return;
    }

    try {
      await saveGameSave(currentState.save);

      setState((current) => ({
        ...current,
        status: current.save === null ? current.status : "ready",
        noticeMessage: "已保存。"
      }));
    } catch (error) {
      setState((current) => ({
        save: current.save,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "保存失败"
      }));
    }
  }, []);

  const tick = useCallback(() => {
    setState((current) => {
      if (current.status !== "ready" || current.save === null) {
        return current;
      }

      const nextSave = tickGame(current.save);

      if (nextSave === current.save) {
        return current;
      }

      return {
        ...current,
        save: nextSave
      };
    });
  }, []);

  const breakthroughNow = useCallback(async () => {
    if (state.save === null) {
      return;
    }

    const result = breakthrough(state.save);

    if (!result.success) {
      setState({
        ...state,
        noticeMessage: result.message
      });
      return;
    }

    setState({
      save: result.save,
      status: "ready",
      noticeMessage: result.message
    });

    try {
      await saveGameSave(result.save);
    } catch (error) {
      setState({
        save: result.save,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "突破后保存失败",
        noticeMessage: result.message
      });
    }
  }, [state]);

  const changeMap = useCallback(
    async (mapId: string) => {
      if (state.save === null) {
        return;
      }

      const targetMap = MAPS.find((map) => map.id === mapId);

      if (targetMap === undefined || !isMapUnlocked(mapId, state.save.player.realmId)) {
        setState({
          ...state,
          noticeMessage: "该地图尚未解锁。"
        });
        return;
      }

      const now = Date.now();
      const changedSave = appendSystemLog(
        {
          ...state.save,
          meta: {
            ...state.save.meta,
            updatedAt: now
          },
          map: {
            ...state.save.map,
            currentMapId: mapId
          },
          player: {
            ...state.save.player,
            progress: {
              ...state.save.player.progress,
              currentMapId: mapId
            }
          },
          runtime: {
            ...state.save.runtime,
            time: {
              ...state.save.runtime.time,
              updatedAt: now
            }
          }
        },
        `已前往${targetMap.name}。`,
        now
      );

      setState({
        save: changedSave,
        status: "ready",
        noticeMessage: `已前往${targetMap.name}。`
      });

      try {
        await saveGameSave(changedSave);
      } catch (error) {
        setState({
          save: changedSave,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "切换地图后保存失败",
          noticeMessage: `已前往${targetMap.name}。`
        });
      }
    },
    [state]
  );

  const clearError = useCallback(() => {
    setState((current) => ({
      save: current.save,
      status: current.save === null ? "no-save" : "ready",
      noticeMessage: current.noticeMessage
    }));
  }, []);

  const value = useMemo<GameStoreValue>(
    () => ({
      ...state,
      loadSave,
      createCharacter,
      saveNow,
      tick,
      breakthroughNow,
      changeMap,
      clearError
    }),
    [breakthroughNow, changeMap, clearError, createCharacter, loadSave, saveNow, state, tick]
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

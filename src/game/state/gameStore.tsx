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
import type { EquipmentSlot, GameLogEntry, GameLogType, GameSaveData } from "../types";
import { createNewGame } from "../core/createNewGame";
import { breakthrough } from "../core/breakthrough";
import { tickGame } from "../core/tick";
import { isMapUnlockedForSave } from "../core/mapUnlock";
import { MAPS } from "../config";
import { createId } from "../core/random";
import {
  canEquip,
  equipItem as equipCoreItem,
  unequipItem as unequipCoreItem
} from "../core/equipment";
import { enhanceEquipment } from "../core/enhancement";
import { loadGameSave, saveGameSave } from "../../services/saveApi";
import { calculateOfflineReward } from "../core/offlineReward";
import { craftPill } from "../core/alchemy";
import { searchMapEncounter } from "../core/encounter";
import { refreshMarket, buyItem, sellItem } from "../core/market";
import { upgradeFacility, plantField, harvestField, collectVeinCultivation, type EstateFacilityType } from "../core/estate";
import type { OfflineRewardSummary } from "../types";

export type GameStoreStatus = "loading" | "no-save" | "ready" | "error";

interface GameStoreState {
  save: GameSaveData | null;
  status: GameStoreStatus;
  errorMessage?: string;
  noticeMessage?: string;
  offlineReward: OfflineRewardSummary | null;
}

interface GameStoreValue extends GameStoreState {
  loadSave: () => Promise<void>;
  createCharacter: (name: string) => Promise<void>;
  saveNow: () => Promise<void>;
  tick: () => void;
  breakthroughNow: () => Promise<void>;
  changeMap: (mapId: string) => Promise<void>;
  searchEncounterNow: () => Promise<void>;
  toggleAutoBattleNow: () => Promise<void>;
  equipItemNow: (instanceId: string) => Promise<void>;
  unequipSlotNow: (slot: EquipmentSlot) => Promise<void>;
  discardEquipment: (instanceId: string) => Promise<void>;
  clearError: () => void;
  dismissOfflineReward: () => void;
  craftPillNow: (recipeId: string) => Promise<void>;
  refreshMarketNow: () => void;
  buyMarketItem: (marketItemId: string, quantity?: number) => Promise<void>;
  sellInventoryItem: (itemId: string, quantity?: number) => Promise<void>;
  upgradeEstateFacility: (facilityType: EstateFacilityType, fieldIndex?: number) => Promise<void>;
  plantEstateField: (fieldIndex: number, cropItemId: string) => Promise<void>;
  harvestEstateField: (fieldIndex: number) => Promise<void>;
  collectVeinCultivationNow: () => Promise<void>;
  enhanceEquipmentNow: (instanceId: string) => Promise<void>;
}

const GameStoreContext = createContext<GameStoreValue | null>(null);

function appendLog(
  save: GameSaveData,
  type: GameLogType,
  message: string,
  now: number
): GameSaveData {
  const entry: GameLogEntry = {
    id: createId("log"),
    type,
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

function appendSystemLog(save: GameSaveData, message: string, now: number): GameSaveData {
  return appendLog(save, "system", message, now);
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameStoreState>({
    save: null,
    status: "loading",
    offlineReward: null
  });
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const loadSave = useCallback(async () => {
    setState((current) => ({
      save: current.save,
      status: "loading",
      noticeMessage: current.noticeMessage,
      offlineReward: null
    }));

    try {
      const loadedSave = await loadGameSave();

      if (loadedSave === null) {
        setState({
          save: null,
          status: "no-save",
          offlineReward: null
        });
        return;
      }

      const now = Date.now();
      const offlineMs = now - loadedSave.runtime.time.lastActiveAt;
      const hasOfflineReward =
        loadedSave.settings.offlineRewardEnabled && offlineMs > 60000;

      if (hasOfflineReward) {
        const result = calculateOfflineReward(loadedSave, now);
        await saveGameSave(result.save);

        setState({
          save: result.save,
          status: "ready",
          noticeMessage: "已读取本地存档，离线收益已结算。",
          offlineReward: result.summary
        });
      } else {
        setState({
          save: loadedSave,
          status: "ready",
          noticeMessage: "已读取本地存档。",
          offlineReward: null
        });
      }
    } catch (error) {
      setState({
        save: null,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "读取存档失败",
        offlineReward: null
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
        noticeMessage: "角色创建完成。",
        offlineReward: null
      });
    } catch (error) {
      setState({
        save: null,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "创建角色失败",
        offlineReward: null
      });
    }
  }, []);

  const saveNow = useCallback(async () => {
    const currentState = stateRef.current;

    if (currentState.save === null) {
      setState({
        save: null,
        status: "error",
        errorMessage: "当前没有可保存的存档",
        offlineReward: null
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
        errorMessage: error instanceof Error ? error.message : "保存失败",
        offlineReward: current.offlineReward
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
      noticeMessage: result.message,
      offlineReward: null
    });

    try {
      await saveGameSave(result.save);
    } catch (error) {
      setState({
        save: result.save,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "突破后保存失败",
        noticeMessage: result.message,
        offlineReward: null
      });
    }
  }, [state]);

  const changeMap = useCallback(
    async (mapId: string) => {
      if (state.save === null) {
        return;
      }

      const targetMap = MAPS.find((map) => map.id === mapId);

      if (targetMap === undefined || !isMapUnlockedForSave(state.save, mapId)) {
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
          },
          autoBattle: {
            ...state.save.autoBattle,
            currentEnemy: undefined,
            playerActionProgress: 0,
            enemyActionProgress: 0,
            lastAttackAt: now,
            battleStartedAt: state.save.autoBattle.battleStartedAt ?? now
          }
        },
        `已前往${targetMap.name}。`,
        now
      );

      setState({
        save: changedSave,
        status: "ready",
        noticeMessage: `已前往${targetMap.name}。`,
        offlineReward: null
      });

      try {
        await saveGameSave(changedSave);
      } catch (error) {
        setState({
          save: changedSave,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "切换地图后保存失败",
          noticeMessage: `已前往${targetMap.name}。`,
          offlineReward: null
        });
      }
    },
    [state]
  );

  const toggleAutoBattleNow = useCallback(async () => {
    if (state.save === null) {
      return;
    }

    const now = Date.now();
    const willEnable = !state.save.autoBattle.enabled;
    const message = willEnable ? "自动历练已开启。" : "自动历练已暂停。";
    const nextSave = appendSystemLog(
      {
        ...state.save,
        meta: {
          ...state.save.meta,
          updatedAt: now
        },
        autoBattle: {
          ...state.save.autoBattle,
          enabled: willEnable,
          lastAttackAt: willEnable ? now : state.save.autoBattle.lastAttackAt,
          battleStartedAt: state.save.autoBattle.battleStartedAt ?? now
        },
        runtime: {
          ...state.save.runtime,
          time: {
            ...state.save.runtime.time,
            updatedAt: now
          }
        }
      },
      message,
      now
    );

    setState({
      save: nextSave,
      status: "ready",
      noticeMessage: message,
      offlineReward: null
    });

    try {
      await saveGameSave(nextSave);
    } catch (error) {
      setState({
        save: nextSave,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "切换自动历练状态后保存失败",
        noticeMessage: message,
        offlineReward: null
      });
    }
  }, [state]);

  const searchEncounterNow = useCallback(async () => {
    if (state.save === null) {
      return;
    }

    const result = searchMapEncounter(state.save);

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
      noticeMessage: result.message,
      offlineReward: null
    });

    try {
      await saveGameSave(result.save);
    } catch (error) {
      setState({
        save: result.save,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "奇遇后保存失败",
        noticeMessage: result.message,
        offlineReward: null
      });
    }
  }, [state]);

  const equipItemNow = useCallback(
    async (instanceId: string) => {
      if (state.save === null) {
        return;
      }

      if (!canEquip(state.save, instanceId)) {
        setState({
          ...state,
          noticeMessage: "该装备不存在。"
        });
        return;
      }

      const nextSave = equipCoreItem(state.save, instanceId);

      setState({
        save: nextSave,
        status: "ready",
        noticeMessage: "装备已穿戴。",
        offlineReward: null
      });

      try {
        await saveGameSave(nextSave);
      } catch (error) {
        setState({
          save: nextSave,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "穿戴装备后保存失败",
          noticeMessage: "装备已穿戴。",
          offlineReward: null
        });
      }
    },
    [state]
  );

  const unequipSlotNow = useCallback(
    async (slot: EquipmentSlot) => {
      if (state.save === null) {
        return;
      }

      const nextSave = unequipCoreItem(state.save, slot);

      setState({
        save: nextSave,
        status: "ready",
        noticeMessage: "装备已卸下。",
        offlineReward: null
      });

      try {
        await saveGameSave(nextSave);
      } catch (error) {
        setState({
          save: nextSave,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "卸下装备后保存失败",
          noticeMessage: "装备已卸下。",
          offlineReward: null
        });
      }
    },
    [state]
  );

  const discardEquipment = useCallback(
    async (instanceId: string) => {
      if (state.save === null) {
        return;
      }

      const equippedInstanceIds = Object.values(state.save.player.equipped);

      if (equippedInstanceIds.includes(instanceId)) {
        setState({
          ...state,
          noticeMessage: "已装备的装备不能丢弃。"
        });
        return;
      }

      const equipment = state.save.inventory.equipments.find(
        (item) => item.instanceId === instanceId
      );

      if (equipment === undefined) {
        setState({
          ...state,
          noticeMessage: "该装备不存在。"
        });
        return;
      }

      const now = Date.now();
      const nextSave = appendLog(
        {
          ...state.save,
          meta: {
            ...state.save.meta,
            updatedAt: now
          },
          inventory: {
            ...state.save.inventory,
            equipments: state.save.inventory.equipments.filter(
              (item) => item.instanceId !== instanceId
            )
          },
          runtime: {
            ...state.save.runtime,
            time: {
              ...state.save.runtime.time,
              updatedAt: now
            }
          }
        },
        "equipment",
        `已丢弃${equipment.name}。`,
        now
      );

      setState({
        save: nextSave,
        status: "ready",
        noticeMessage: `已丢弃${equipment.name}。`,
        offlineReward: null
      });

      try {
        await saveGameSave(nextSave);
      } catch (error) {
        setState({
          save: nextSave,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "丢弃装备后保存失败",
          noticeMessage: `已丢弃${equipment.name}。`,
          offlineReward: null
        });
      }
    },
    [state]
  );

  const clearError = useCallback(() => {
    setState((current) => ({
      save: current.save,
      status: current.save === null ? "no-save" : "ready",
      noticeMessage: current.noticeMessage,
      offlineReward: current.offlineReward
    }));
  }, []);

  const dismissOfflineReward = useCallback(() => {
    setState((current) => ({
      ...current,
      offlineReward: null
    }));
  }, []);

  const craftPillNow = useCallback(
    async (recipeId: string) => {
      if (state.save === null) {
        return;
      }

      const result = craftPill(state.save, recipeId);

      setState({
        save: result.save,
        status: "ready",
        noticeMessage: result.message,
        offlineReward: null
      });

      try {
        await saveGameSave(result.save);
      } catch (error) {
        setState({
          save: result.save,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "炼丹后保存失败",
          noticeMessage: result.message,
          offlineReward: null
        });
      }
    },
    [state]
  );

  const refreshMarketNow = useCallback(() => {
    setState((current) => {
      if (current.save === null) {
        return current;
      }

      const refreshed = refreshMarket(current.save.market);

      return {
        ...current,
        save: {
          ...current.save,
          market: refreshed
        }
      };
    });
  }, []);

  const buyMarketItem = useCallback(
    async (marketItemId: string, quantity = 1) => {
      if (state.save === null) {
        return;
      }

      const result = buyItem(state.save, marketItemId, quantity);

      setState({
        save: result.save,
        status: "ready",
        noticeMessage: result.message,
        offlineReward: null
      });

      try {
        await saveGameSave(result.save);
      } catch (error) {
        setState({
          save: result.save,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "购买后保存失败",
          noticeMessage: result.message,
          offlineReward: null
        });
      }
    },
    [state]
  );

  const sellInventoryItem = useCallback(
    async (itemId: string, quantity = 1) => {
      if (state.save === null) {
        return;
      }

      const result = sellItem(state.save, itemId, quantity);

      setState({
        save: result.save,
        status: "ready",
        noticeMessage: result.message,
        offlineReward: null
      });

      try {
        await saveGameSave(result.save);
      } catch (error) {
        setState({
          save: result.save,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "出售后保存失败",
          noticeMessage: result.message,
          offlineReward: null
        });
      }
    },
    [state]
  );

  const upgradeEstateFacility = useCallback(
    async (facilityType: EstateFacilityType, fieldIndex?: number) => {
      if (state.save === null) {
        return;
      }

      const result = upgradeFacility(state.save, facilityType, fieldIndex);

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
        noticeMessage: result.message,
        offlineReward: null
      });

      try {
        await saveGameSave(result.save);
      } catch (error) {
        setState({
          save: result.save,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "洞府升级后保存失败",
          noticeMessage: result.message,
          offlineReward: null
        });
      }
    },
    [state]
  );

  const plantEstateField = useCallback(
    async (fieldIndex: number, cropItemId: string) => {
      if (state.save === null) {
        return;
      }

      const result = plantField(state.save, fieldIndex, cropItemId);

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
        noticeMessage: result.message,
        offlineReward: null
      });

      try {
        await saveGameSave(result.save);
      } catch (error) {
        setState({
          save: result.save,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "种植后保存失败",
          noticeMessage: result.message,
          offlineReward: null
        });
      }
    },
    [state]
  );

  const harvestEstateField = useCallback(
    async (fieldIndex: number) => {
      if (state.save === null) {
        return;
      }

      const result = harvestField(state.save, fieldIndex);

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
        noticeMessage: result.message,
        offlineReward: null
      });

      try {
        await saveGameSave(result.save);
      } catch (error) {
        setState({
          save: result.save,
          status: "error",
          errorMessage: error instanceof Error ? error.message : "收获后保存失败",
          noticeMessage: result.message,
          offlineReward: null
        });
      }
    },
    [state]
  );

  const collectVeinCultivationNow = useCallback(async () => {
    if (state.save === null) {
      return;
    }

    const result = collectVeinCultivation(state.save);

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
      noticeMessage: result.message,
      offlineReward: null
    });

    try {
      await saveGameSave(result.save);
    } catch (error) {
      setState({
        save: result.save,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "收取修为后保存失败",
        noticeMessage: result.message,
        offlineReward: null
      });
    }
  }, [state]);

  const enhanceEquipmentNow = useCallback(async (instanceId: string) => {
    if (state.save === null) {
      return;
    }

    const result = enhanceEquipment(state.save, instanceId);

    setState({
      save: result.save,
      status: "ready",
      noticeMessage: result.message,
      offlineReward: null
    });

    try {
      await saveGameSave(result.save);
    } catch (error) {
      setState({
        save: result.save,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "强化后保存失败",
        noticeMessage: result.message,
        offlineReward: null
      });
    }
  }, [state]);

  const value = useMemo<GameStoreValue>(
    () => ({
      ...state,
      loadSave,
      createCharacter,
      saveNow,
      tick,
      breakthroughNow,
      changeMap,
      searchEncounterNow,
      toggleAutoBattleNow,
      equipItemNow,
      unequipSlotNow,
      discardEquipment,
      clearError,
      dismissOfflineReward,
      craftPillNow,
      refreshMarketNow,
      buyMarketItem,
      sellInventoryItem,
      upgradeEstateFacility,
      plantEstateField,
      harvestEstateField,
      collectVeinCultivationNow,
      enhanceEquipmentNow
    }),
    [
      breakthroughNow,
      buyMarketItem,
      changeMap,
      clearError,
      collectVeinCultivationNow,
      craftPillNow,
      createCharacter,
      discardEquipment,
      dismissOfflineReward,
      equipItemNow,
      harvestEstateField,
      loadSave,
      plantEstateField,
      refreshMarketNow,
      saveNow,
      searchEncounterNow,
      sellInventoryItem,
      state,
      tick,
      toggleAutoBattleNow,
      unequipSlotNow,
      upgradeEstateFacility,
      enhanceEquipmentNow
    ]
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

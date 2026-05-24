import type { SaveVersion, GameTimeState, OfflineRewardSummary } from "./common";
import type { PlayerState } from "./player";
import type { InventoryState } from "./item";
import type { MapState } from "./map";
import type { AutoBattleState } from "./monster";
import type { GameLogState } from "./log";
import type { AlchemyState, MarketState } from "./alchemy";
import type { EstateState } from "./estate";
import type { TechniqueState } from "./technique";
import type { ObjectiveState } from "./objective";

export interface SaveMeta {
  version: SaveVersion;
  slotId: string;
  playerName: string;
  createdAt: number;
  updatedAt: number;
}

export interface GameSettingsState {
  autoSaveEnabled: boolean;
  autoSaveIntervalMs: number;
  offlineRewardEnabled: boolean;
  offlineRewardCapMs: number;
}

export interface GameRuntimeState {
  time: GameTimeState;
  lastOfflineReward?: OfflineRewardSummary;
}

export interface GameSaveData {
  version: SaveVersion;
  meta: SaveMeta;
  player: PlayerState;
  inventory: InventoryState;
  map: MapState;
  autoBattle: AutoBattleState;
  logs: GameLogState;
  settings: GameSettingsState;
  runtime: GameRuntimeState;
  alchemy: AlchemyState;
  market: MarketState;
  estate: EstateState;
  techniques: TechniqueState;
  objectives: ObjectiveState;
}

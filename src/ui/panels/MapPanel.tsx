import type { GameSaveData } from "../../game/types";
import { getEncounterCooldownRemaining } from "../../game/core/encounter";
import { getCurrentMap, getUnlockedMaps } from "../../game/core/selectors";
import { useGameStore } from "../../game/state/gameStore";

function formatCooldown(ms: number): string {
  if (ms <= 0) return "可寻访";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}分${seconds}秒`;
}

export function MapPanel({ save }: { save: GameSaveData }) {
  const { changeMap, searchEncounterNow } = useGameStore();
  const currentMap = getCurrentMap(save);
  const unlockedMaps = getUnlockedMaps(save);
  const encounterCooldown = getEncounterCooldownRemaining(save);
  const canSearchEncounter = encounterCooldown <= 0;

  return (
    <section className="panel map-panel">
      <div className="panel-heading">
        <span className="eyebrow">Map</span>
        <h2>{currentMap?.name ?? "未知地图"}</h2>
      </div>

      <div className="map-encounter-card">
        <div>
          <strong>云游奇遇</strong>
          <span>{formatCooldown(encounterCooldown)} · 已遇 {save.map.encounter.totalEncounters}</span>
        </div>
        <button
          className="secondary-button map-button"
          disabled={!canSearchEncounter}
          type="button"
          onClick={() => void searchEncounterNow()}
        >
          寻访
        </button>
      </div>

      <div className="map-list" aria-label="已解锁地图列表">
        {unlockedMaps.map((map) => (
          <div
            className={map.id === save.map.currentMapId ? "map-item map-item-current" : "map-item"}
            key={map.id}
          >
            <div className="map-item-header">
              <span>{map.name}</span>
              <button
                className="secondary-button map-button"
                disabled={map.id === save.map.currentMapId}
                type="button"
                onClick={() => void changeMap(map.id)}
              >
                {map.id === save.map.currentMapId ? "当前" : "前往"}
              </button>
            </div>
            <p title={map.description}>{map.description}</p>
            <small>
              修为 {map.baseCultivationPerSecond}/秒 · 灵石 {map.baseSpiritStonesPerMinute}/分
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}

import type { GameSaveData } from "../../game/types";
import { getCurrentMap, getUnlockedMaps } from "../../game/core/selectors";

export function MapPanel({ save }: { save: GameSaveData }) {
  const currentMap = getCurrentMap(save);
  const unlockedMaps = getUnlockedMaps(save);

  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="eyebrow">Map</span>
        <h2>{currentMap?.name ?? "未知地图"}</h2>
      </div>

      <p className="panel-description">
        {currentMap?.description ?? "当前存档记录的地图不存在于配置表中。"}
      </p>

      <div className="map-list" aria-label="已解锁地图列表">
        {unlockedMaps.map((map) => (
          <div
            className={map.id === save.map.currentMapId ? "map-item map-item-current" : "map-item"}
            key={map.id}
          >
            <span>{map.name}</span>
            <small>
              修为 {map.baseCultivationPerSecond}/秒 · 灵石 {map.baseSpiritStonesPerMinute}/分
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}

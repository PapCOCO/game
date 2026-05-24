import { useState } from "react";
import type { GameSaveData } from "../../game/types";
import { ESTATE_CONFIG } from "../../game/config/estate";
import { ITEMS } from "../../game/config/items";
import {
  getFieldHarvestTime,
  getFieldCropQuantity,
  getAvailableCrops,
  getVeinCultivationPerMinute,
  getGatheringBonusPercent,
  getPillFurnaceQuality,
  calculateAccumulatedCultivation,
  isFieldReady,
  getFieldTimeRemaining,
  getEstateLevelFromExp
} from "../../game/core/estate";
import { useGameStore } from "../../game/state/gameStore";
import { AlchemyPanel } from "./AlchemyPanel";

function formatDuration(ms: number): string {
  if (ms <= 0) return "已成熟";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}分${seconds}秒`;
}

function getItemName(itemId: string): string {
  return ITEMS.find((item) => item.id === itemId)?.name ?? itemId;
}

function getUpgradeCostText(facility: "spiritField" | "spiritVein" | "gatheringArray" | "pillFurnace", currentLevel: number): string {
  const costs = ESTATE_CONFIG[facility].upgradeCosts;
  const cost = costs[currentLevel] ?? costs[costs.length - 1];
  if (cost === undefined) return "";
  const parts: string[] = [];
  if (cost.spiritStones > 0) parts.push(`${cost.spiritStones}灵石`);
  for (const mat of cost.materials) {
    parts.push(`${getItemName(mat.itemId)} x${mat.quantity}`);
  }
  return parts.join(" + ");
}

export function EstatePanel({ save }: { save: GameSaveData }) {
  const {
    upgradeEstateFacility,
    plantEstateField,
    harvestEstateField,
    collectVeinCultivationNow
  } = useGameStore();
  const [selectedCrop, setSelectedCrop] = useState<Record<number, string>>({});

  const estate = save.estate;
  const now = Date.now();
  const estateLevel = getEstateLevelFromExp(estate.exp);
  const nextLevelExp = ESTATE_CONFIG.estateLevelRequirements[estateLevel] ?? ESTATE_CONFIG.estateLevelRequirements[ESTATE_CONFIG.estateLevelRequirements.length - 1];
  const currentLevelBase = estateLevel > 1 ? (ESTATE_CONFIG.estateLevelRequirements[estateLevel - 2] ?? 0) : 0;
  const levelProgress = estateLevel >= ESTATE_CONFIG.maxEstateLevel ? 1 : (estate.exp - currentLevelBase) / (nextLevelExp - currentLevelBase);

  const availableCrops = getAvailableCrops(estateLevel);
  const furnace = getPillFurnaceQuality(estate.pillFurnace.level);

  return (
    <section className="panel estate-panel">
      <div className="panel-heading">
        <span className="eyebrow">Estate</span>
        <h2>洞府</h2>
      </div>

      <div className="estate-status">
        <div className="estate-level-row">
          <span>洞府等级</span>
          <strong>Lv.{estateLevel}</strong>
          <span className="estate-exp">
            {estateLevel >= ESTATE_CONFIG.maxEstateLevel ? "已满级" : `${estate.exp} / ${nextLevelExp}`}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(1, Math.max(0, levelProgress)) * 100}%` }}
          />
        </div>
      </div>

      <div className="estate-facilities">
        <h3>丹炉</h3>
        <div className="estate-facility-card">
          <div className="estate-facility-header">
            <strong>{furnace.name}</strong>
            <span>Lv.{estate.pillFurnace.level}</span>
          </div>
          <div className="estate-furnace-stats">
            <span>成丹率 +{(furnace.successBonus * 100).toFixed(0)}%</span>
            <span>灵石消耗 -{furnace.costReductionPercent}%</span>
            <span>额外出丹 {(furnace.extraYieldChance * 100).toFixed(0)}%</span>
            <span>炼丹经验 +{furnace.expBonusPercent}%</span>
          </div>
          {estate.pillFurnace.level < ESTATE_CONFIG.pillFurnace.maxLevel ? (
            <div className="estate-upgrade-row">
              <small>升级: {getUpgradeCostText("pillFurnace", estate.pillFurnace.level)}</small>
              <button
                className="text-button"
                type="button"
                onClick={() => void upgradeEstateFacility("pillFurnace")}
              >
                升级
              </button>
            </div>
          ) : null}
        </div>

        <AlchemyPanel save={save} embedded />

        <h3>灵田</h3>
        <div className="estate-field-list">
          {estate.spiritFields.map((field, index) => {
            const ready = isFieldReady(field, now);
            const timeRemaining = getFieldTimeRemaining(field, now);
            const harvestTime = getFieldHarvestTime(field.level);

            return (
              <div className={`estate-field-card ${field.unlocked ? "" : "estate-locked"}`} key={index}>
                <div className="estate-field-header">
                  <strong>灵田 {index + 1}</strong>
                  <span>Lv.{field.level}</span>
                </div>

                {!field.unlocked ? (
                  <div className="estate-field-locked">
                    <span>未解锁</span>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => void upgradeEstateFacility("spiritField", index)}
                    >
                      解锁
                    </button>
                  </div>
                ) : field.cropItemId === null ? (
                  <div className="estate-field-empty">
                    <span>空闲中</span>
                    <div className="estate-plant-row">
                      <select
                        className="estate-crop-select"
                        value={selectedCrop[index] ?? availableCrops[0]?.itemId ?? ""}
                        onChange={(e) => setSelectedCrop((prev) => ({ ...prev, [index]: e.target.value }))}
                      >
                        {availableCrops.map((crop) => (
                          <option key={crop.itemId} value={crop.itemId}>
                            {crop.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => void plantEstateField(index, selectedCrop[index] ?? availableCrops[0]?.itemId ?? "")}
                      >
                        种植
                      </button>
                    </div>
                    <small>收获时间 {formatDuration(harvestTime)} · 产量 {getFieldCropQuantity(field.level)}</small>
                  </div>
                ) : (
                  <div className="estate-field-growing">
                    <span className="estate-crop-name">
                      {ESTATE_CONFIG.spiritField.crops.find((c) => c.itemId === field.cropItemId)?.name ?? field.cropItemId}
                    </span>
                    <span className={ready ? "estate-ready" : ""}>
                      {ready ? "已成熟" : `剩余 ${formatDuration(timeRemaining)}`}
                    </span>
                    <span>产量 {field.cropQuantity}</span>
                    {ready ? (
                      <button
                        className="primary-button compact-button"
                        type="button"
                        onClick={() => void harvestEstateField(index)}
                      >
                        收获
                      </button>
                    ) : null}
                  </div>
                )}

                {field.unlocked && field.level < ESTATE_CONFIG.spiritField.maxLevel ? (
                  <div className="estate-upgrade-row">
                    <small>升级: {getUpgradeCostText("spiritField", field.level)}</small>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => void upgradeEstateFacility("spiritField", index)}
                    >
                      升级
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <h3>灵脉</h3>
        <div className={`estate-facility-card ${estate.spiritVein.unlocked ? "" : "estate-locked"}`}>
          <div className="estate-facility-header">
            <strong>灵脉</strong>
            <span>{estate.spiritVein.unlocked ? `Lv.${estate.spiritVein.level}` : "未开启"}</span>
          </div>

          {estate.spiritVein.unlocked ? (
            <>
              <div className="estate-vein-stats">
                <span>每分钟 {getVeinCultivationPerMinute(estate.spiritVein.level)} 修为</span>
                <span>已积累 {Math.floor(calculateAccumulatedCultivation(estate.spiritVein, now))} 修为</span>
              </div>
              <button
                className="primary-button compact-button"
                type="button"
                onClick={() => void collectVeinCultivationNow()}
              >
                收取修为
              </button>
              {estate.spiritVein.level < ESTATE_CONFIG.spiritVein.maxLevel ? (
                <div className="estate-upgrade-row">
                  <small>升级: {getUpgradeCostText("spiritVein", estate.spiritVein.level)}</small>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => void upgradeEstateFacility("spiritVein")}
                  >
                    升级
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="estate-unlock-row">
              <span>消耗 {getUpgradeCostText("spiritVein", 0)} 开启灵脉</span>
              <button
                className="text-button"
                type="button"
                onClick={() => void upgradeEstateFacility("spiritVein")}
              >
                开启
              </button>
            </div>
          )}
        </div>

        <h3>聚灵阵</h3>
        <div className={`estate-facility-card ${estate.gatheringArray.unlocked ? "" : "estate-locked"}`}>
          <div className="estate-facility-header">
            <strong>聚灵阵</strong>
            <span>{estate.gatheringArray.unlocked ? `Lv.${estate.gatheringArray.level}` : "未开启"}</span>
          </div>

          {estate.gatheringArray.unlocked ? (
            <>
              <div className="estate-array-stats">
                <span>修炼效率 +{getGatheringBonusPercent(estate.gatheringArray.level)}%</span>
              </div>
              {estate.gatheringArray.level < ESTATE_CONFIG.gatheringArray.maxLevel ? (
                <div className="estate-upgrade-row">
                  <small>升级: {getUpgradeCostText("gatheringArray", estate.gatheringArray.level)}</small>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => void upgradeEstateFacility("gatheringArray")}
                  >
                    升级
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="estate-unlock-row">
              <span>消耗 {getUpgradeCostText("gatheringArray", 0)} 开启聚灵阵</span>
              <button
                className="text-button"
                type="button"
                onClick={() => void upgradeEstateFacility("gatheringArray")}
              >
                开启
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

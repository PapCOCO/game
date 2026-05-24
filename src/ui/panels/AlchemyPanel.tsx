import { useState } from "react";
import type { GameSaveData } from "../../game/types";
import { RECIPES } from "../../game/config/recipes";
import { ITEMS } from "../../game/config/items";
import { calculateSuccessRate, getAlchemyLevelExpRequirement, getRecipeSpiritStoneCost } from "../../game/core/alchemy";
import { getPillFurnaceQuality } from "../../game/core/estate";
import { useGameStore } from "../../game/state/gameStore";

function getItemName(itemId: string): string {
  return ITEMS.find((item) => item.id === itemId)?.name ?? itemId;
}

function getInventoryQuantity(save: GameSaveData, itemId: string): number {
  const material = save.inventory.materials.find((m) => m.itemId === itemId);
  if (material !== undefined) return material.quantity;
  const consumable = save.inventory.consumables.find((c) => c.itemId === itemId);
  return consumable?.quantity ?? 0;
}

export function AlchemyPanel({ save, embedded = false }: { save: GameSaveData; embedded?: boolean }) {
  const { craftPillNow } = useGameStore();
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const alchemy = save.alchemy;
  const furnaceLevel = save.estate.pillFurnace.level;
  const furnace = getPillFurnaceQuality(furnaceLevel);
  const currentLevelReq = getAlchemyLevelExpRequirement(alchemy.level);
  const nextLevelReq = getAlchemyLevelExpRequirement(alchemy.level + 1);
  const levelProgress = alchemy.level >= 10 ? 1 : (alchemy.exp - currentLevelReq) / (nextLevelReq - currentLevelReq);

  const selectedRecipe = RECIPES.find((r) => r.id === selectedRecipeId);

  function canCraft(recipe: typeof RECIPES[number]): boolean {
    if (alchemy.level < recipe.requiredAlchemyLevel) return false;
    if (save.player.spiritStones < getRecipeSpiritStoneCost(recipe, furnaceLevel)) return false;
    for (const material of recipe.materials) {
      if (getInventoryQuantity(save, material.itemId) < material.quantity) return false;
    }
    return true;
  }

  return (
    <section className={embedded ? "estate-alchemy-section" : "panel alchemy-panel"}>
      <div className="panel-heading">
        <span className="eyebrow">Alchemy</span>
        <h2>炼丹</h2>
      </div>

      <div className="alchemy-status">
        <div className="alchemy-level-row">
          <span>炼丹等级</span>
          <strong>Lv.{alchemy.level}</strong>
          <span className="alchemy-exp">
            {alchemy.level >= 10 ? "已满级" : `${alchemy.exp} / ${nextLevelReq}`}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(1, Math.max(0, levelProgress)) * 100}%` }}
          />
        </div>
        <div className="alchemy-stats-row">
          <span>尝试 {alchemy.totalAttempts}</span>
          <span>成功 {alchemy.totalSuccesses}</span>
          <span>成功率 {alchemy.totalAttempts > 0 ? ((alchemy.totalSuccesses / alchemy.totalAttempts) * 100).toFixed(0) : 0}%</span>
        </div>
        <div className="alchemy-stats-row">
          <span>{furnace.name}</span>
          <span>炉成 +{(furnace.successBonus * 100).toFixed(0)}%</span>
          <span>省灵石 {furnace.costReductionPercent}%</span>
        </div>
      </div>

      <div className="alchemy-recipe-list">
        {RECIPES.map((recipe) => {
          const successRate = calculateSuccessRate(recipe, alchemy.level, furnaceLevel);
          const spiritStoneCost = getRecipeSpiritStoneCost(recipe, furnaceLevel);
          const craftable = canCraft(recipe);
          const isSelected = selectedRecipeId === recipe.id;

          return (
            <button
              className={`alchemy-recipe-row ${isSelected ? "alchemy-recipe-active" : ""}`}
              key={recipe.id}
              type="button"
              onClick={() => setSelectedRecipeId(isSelected ? null : recipe.id)}
            >
              <div className="alchemy-recipe-header">
                <strong>{recipe.name}</strong>
                <span className={`alchemy-level-tag ${alchemy.level >= recipe.requiredAlchemyLevel ? "" : "alchemy-level-locked"}`}>
                  Lv.{recipe.requiredAlchemyLevel}
                </span>
              </div>
              <p className="alchemy-recipe-desc">{recipe.description}</p>
              <div className="alchemy-recipe-meta">
                <span>成功率 {(successRate * 100).toFixed(0)}%</span>
                <span>灵石 {spiritStoneCost}</span>
              </div>
              {isSelected ? (
                <div className="alchemy-materials">
                  {recipe.materials.map((mat) => {
                    const have = getInventoryQuantity(save, mat.itemId);
                    const enough = have >= mat.quantity;
                    return (
                      <span key={mat.itemId} className={enough ? "" : "alchemy-material-missing"}>
                        {getItemName(mat.itemId)} x{mat.quantity} (拥有 {have})
                      </span>
                    );
                  })}
                  <button
                    className="primary-button panel-action"
                    disabled={!craftable}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void craftPillNow(recipe.id);
                    }}
                  >
                    炼制
                  </button>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {selectedRecipe !== undefined ? (
        <div className="alchemy-detail">
          <strong>{selectedRecipe.name}</strong>
          <p>{selectedRecipe.description}</p>
          <div className="alchemy-detail-materials">
            {selectedRecipe.materials.map((mat) => {
              const have = getInventoryQuantity(save, mat.itemId);
              const enough = have >= mat.quantity;
              return (
                <div key={mat.itemId} className={`alchemy-material-line ${enough ? "" : "alchemy-material-missing"}`}>
                  <span>{getItemName(mat.itemId)}</span>
                  <span>x{mat.quantity}</span>
                  <small>{have} 拥有</small>
                </div>
              );
            })}
          </div>
          <div className="alchemy-detail-cost">
            <span>灵石消耗</span>
            <strong>{getRecipeSpiritStoneCost(selectedRecipe, furnaceLevel)}</strong>
            <small>当前 {save.player.spiritStones}</small>
          </div>
          <button
            className="primary-button panel-action"
            disabled={!canCraft(selectedRecipe)}
            type="button"
            onClick={() => void craftPillNow(selectedRecipe.id)}
          >
            开始炼制
          </button>
        </div>
      ) : null}
    </section>
  );
}

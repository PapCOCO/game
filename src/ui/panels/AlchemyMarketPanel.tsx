import { useState } from "react";
import type { GameSaveData } from "../../game/types";
import { RECIPES } from "../../game/config/recipes";
import { ITEMS } from "../../game/config/items";

import { SELL_PRICE_RATIO } from "../../game/config/market";
import { calculateSuccessRate, getAlchemyLevelExpRequirement } from "../../game/core/alchemy";
import { useGameStore } from "../../game/state/gameStore";

function getItemName(itemId: string): string {
  return ITEMS.find((item) => item.id === itemId)?.name ?? itemId;
}

function getItemRarity(itemId: string): string {
  return ITEMS.find((item) => item.id === itemId)?.rarity ?? "common";
}

function getInventoryQuantity(save: GameSaveData, itemId: string): number {
  const material = save.inventory.materials.find((m) => m.itemId === itemId);
  if (material !== undefined) return material.quantity;
  const consumable = save.inventory.consumables.find((c) => c.itemId === itemId);
  return consumable?.quantity ?? 0;
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "可刷新";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}分${seconds}秒`;
}

const RARITY_LABELS: Record<string, string> = {
  common: "普通",
  uncommon: "优秀",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说"
};

type MarketTab = "buy" | "sell";

export function AlchemyMarketPanel({ save }: { save: GameSaveData }) {
  const {
    craftPillNow,
    refreshMarketNow,
    buyMarketItem,
    sellInventoryItem
  } = useGameStore();

  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [marketTab, setMarketTab] = useState<MarketTab>("buy");
  const [buyQuantity, setBuyQuantity] = useState<Record<string, number>>({});

  const alchemy = save.alchemy;
  const currentLevelReq = getAlchemyLevelExpRequirement(alchemy.level);
  const nextLevelReq = getAlchemyLevelExpRequirement(alchemy.level + 1);
  const levelProgress = alchemy.level >= 10 ? 1 : (alchemy.exp - currentLevelReq) / (nextLevelReq - currentLevelReq);

  const now = Date.now();
  const timeSinceRefresh = now - save.market.lastRefreshedAt;
  const refreshInterval = 60 * 60 * 1000;
  const timeUntilRefresh = Math.max(0, refreshInterval - timeSinceRefresh);

  const sellableMaterials = save.inventory.materials.filter((m) => {
    const itemDef = ITEMS.find((item) => item.id === m.itemId);
    return itemDef?.category === "material";
  });

  const sellableConsumables = save.inventory.consumables.filter((c) => {
    const itemDef = ITEMS.find((item) => item.id === c.itemId);
    return itemDef?.category === "consumable";
  });

  function canCraft(recipe: typeof RECIPES[number]): boolean {
    if (alchemy.level < recipe.requiredAlchemyLevel) return false;
    if (save.player.spiritStones < recipe.spiritStoneCost) return false;
    for (const material of recipe.materials) {
      if (getInventoryQuantity(save, material.itemId) < material.quantity) return false;
    }
    return true;
  }

  function getSellPrice(itemId: string): number {
    const itemDef = ITEMS.find((item) => item.id === itemId);
    if (itemDef === undefined) return 1;
    const basePrice = itemDef.value ?? 1;
    return Math.max(1, Math.floor(basePrice * SELL_PRICE_RATIO));
  }

  function handleBuy(marketItemId: string, maxQuantity: number) {
    const qty = buyQuantity[marketItemId] ?? 1;
    const actualQty = Math.max(1, Math.min(qty, maxQuantity));
    void buyMarketItem(marketItemId, actualQty);
  }

  return (
    <section className="panel alchemy-market-panel">
      <div className="panel-heading">
        <span className="eyebrow">Alchemy</span>
        <h2>炼丹房</h2>
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
      </div>

      <div className="alchemy-recipe-list">
        {RECIPES.map((recipe) => {
          const successRate = calculateSuccessRate(recipe, alchemy.level);
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
                <span>灵石 {recipe.spiritStoneCost}</span>
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

      <div className="panel-heading market-heading">
        <span className="eyebrow">Market</span>
        <h2>坊市</h2>
      </div>

      <div className="market-status">
        <div className="market-ledger">
          <span>灵石</span>
          <strong>{save.player.spiritStones}</strong>
        </div>
        <div className="market-refresh">
          <span>下次刷新 {formatTimeLeft(timeUntilRefresh)}</span>
          <button
            className="text-button"
            type="button"
            onClick={() => refreshMarketNow()}
          >
            刷新
          </button>
        </div>
      </div>

      <div className="tab-row" role="tablist" aria-label="坊市分类">
        <button
          className={marketTab === "buy" ? "tab-button tab-button-active" : "tab-button"}
          type="button"
          onClick={() => setMarketTab("buy")}
        >
          购买
        </button>
        <button
          className={marketTab === "sell" ? "tab-button tab-button-active" : "tab-button"}
          type="button"
          onClick={() => setMarketTab("sell")}
        >
          出售
        </button>
      </div>

      {marketTab === "buy" ? (
        <div className="market-item-list">
          {save.market.items.length === 0 ? (
            <p className="muted-text">坊市暂无商品，请刷新。</p>
          ) : (
            save.market.items.map((item) => {
              const canAfford = save.player.spiritStones >= item.price;
              const rarity = getItemRarity(item.itemId);
              return (
                <div className={`market-item-row rarity-${rarity}`} key={item.definitionId}>
                  <div className="market-item-info">
                    <strong>{item.name}</strong>
                    <span>{RARITY_LABELS[rarity] ?? rarity} · {item.category === "material" ? "材料" : "丹药"}</span>
                  </div>
                  <div className="market-item-price">
                    <strong>{item.price}</strong>
                    <span>灵石/个</span>
                  </div>
                  <div className="market-item-stock">
                    <span>库存 {item.quantity}</span>
                  </div>
                  <div className="market-item-actions">
                    <input
                      className="market-qty-input"
                      max={item.quantity}
                      min={1}
                      type="number"
                      value={buyQuantity[item.definitionId] ?? 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setBuyQuantity((prev) => ({
                          ...prev,
                          [item.definitionId]: isNaN(val) ? 1 : Math.max(1, Math.min(item.quantity, val))
                        }));
                      }}
                    />
                    <button
                      className="text-button"
                      disabled={!canAfford || item.quantity <= 0}
                      type="button"
                      onClick={() => handleBuy(item.definitionId, item.quantity)}
                    >
                      买
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="market-sell-list">
          {sellableMaterials.length === 0 && sellableConsumables.length === 0 ? (
            <p className="muted-text">没有可出售的物品。</p>
          ) : (
            <>
              {sellableMaterials.length > 0 ? (
                <div className="market-sell-section">
                  <h4>材料</h4>
                  {sellableMaterials.map((stack) => {
                    const rarity = getItemRarity(stack.itemId);
                    const unitPrice = getSellPrice(stack.itemId);
                    return (
                      <div className={`market-sell-row rarity-${rarity}`} key={stack.itemId}>
                        <div className="market-sell-info">
                          <strong>{getItemName(stack.itemId)}</strong>
                          <span>拥有 {stack.quantity}</span>
                        </div>
                        <div className="market-sell-price">
                          <strong>{unitPrice}</strong>
                          <span>灵石/个</span>
                        </div>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => void sellInventoryItem(stack.itemId, 1)}
                        >
                          卖1
                        </button>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => void sellInventoryItem(stack.itemId, Math.min(10, stack.quantity))}
                        >
                          卖10
                        </button>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => void sellInventoryItem(stack.itemId, stack.quantity)}
                        >
                          全卖
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {sellableConsumables.length > 0 ? (
                <div className="market-sell-section">
                  <h4>丹药</h4>
                  {sellableConsumables.map((stack) => {
                    const rarity = getItemRarity(stack.itemId);
                    const unitPrice = getSellPrice(stack.itemId);
                    return (
                      <div className={`market-sell-row rarity-${rarity}`} key={stack.itemId}>
                        <div className="market-sell-info">
                          <strong>{getItemName(stack.itemId)}</strong>
                          <span>拥有 {stack.quantity}</span>
                        </div>
                        <div className="market-sell-price">
                          <strong>{unitPrice}</strong>
                          <span>灵石/个</span>
                        </div>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => void sellInventoryItem(stack.itemId, 1)}
                        >
                          卖1
                        </button>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => void sellInventoryItem(stack.itemId, Math.min(10, stack.quantity))}
                        >
                          卖10
                        </button>
                        <button
                          className="text-button"
                          type="button"
                          onClick={() => void sellInventoryItem(stack.itemId, stack.quantity)}
                        >
                          全卖
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </section>
  );
}

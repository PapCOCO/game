import { useState } from "react";
import type { GameSaveData } from "../../game/types";
import { ITEMS } from "../../game/config/items";
import { MARKET_ITEMS, SELL_PRICE_RATIO } from "../../game/config/market";
import { useGameStore } from "../../game/state/gameStore";

type MarketTab = "buy" | "sell";

const RARITY_LABELS: Record<string, string> = {
  common: "普通",
  uncommon: "优秀",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说"
};

function getItemName(itemId: string): string {
  return ITEMS.find((item) => item.id === itemId)?.name ?? itemId;
}

function getItemRarity(itemId: string): string {
  return ITEMS.find((item) => item.id === itemId)?.rarity ?? "common";
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "可刷新";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}分${seconds}秒`;
}

export function MarketPanel({ save }: { save: GameSaveData }) {
  const { refreshMarketNow, buyMarketItem, sellInventoryItem } = useGameStore();
  const [activeTab, setActiveTab] = useState<MarketTab>("buy");
  const [buyQuantity, setBuyQuantity] = useState<Record<string, number>>({});

  const now = Date.now();
  const timeSinceRefresh = now - save.market.lastRefreshedAt;
  const refreshInterval = 60 * 60 * 1000;
  const timeUntilRefresh = Math.max(0, refreshInterval - timeSinceRefresh);

  const sellableMaterials = save.inventory.materials.filter((m) => {
    const itemDef = ITEMS.find((item) => item.id === m.itemId);
    return itemDef?.type === "material";
  });

  const sellableConsumables = save.inventory.consumables.filter((c) => {
    const itemDef = ITEMS.find((item) => item.id === c.itemId);
    return itemDef?.type === "consumable";
  });

  function getSellPrice(itemId: string): number {
    const itemDef = ITEMS.find((item) => item.id === itemId);
    if (itemDef === undefined) return 1;
    const marketDef = MARKET_ITEMS.find((item) => item.itemId === itemId);
    const basePrice = marketDef?.price ?? itemDef.value ?? 1;
    return Math.max(1, Math.floor(basePrice * SELL_PRICE_RATIO));
  }

  function handleBuy(marketItemId: string, maxQuantity: number) {
    const qty = buyQuantity[marketItemId] ?? 1;
    const actualQty = Math.max(1, Math.min(qty, maxQuantity));
    void buyMarketItem(marketItemId, actualQty);
  }

  return (
    <section className="panel market-panel">
      <div className="panel-heading">
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
          className={activeTab === "buy" ? "tab-button tab-button-active" : "tab-button"}
          type="button"
          onClick={() => setActiveTab("buy")}
        >
          购买
        </button>
        <button
          className={activeTab === "sell" ? "tab-button tab-button-active" : "tab-button"}
          type="button"
          onClick={() => setActiveTab("sell")}
        >
          出售
        </button>
      </div>

      {activeTab === "buy" ? (
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

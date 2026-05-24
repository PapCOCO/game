import type { GameSaveData, MarketItem, MarketState } from "../types";
import { MARKET_ITEMS, MARKET_REFRESH_INTERVAL_MS, SELL_PRICE_RATIO } from "../config/market";
import { ITEMS } from "../config/items";
import { randomInt } from "./random";
import { addItem } from "./inventory";

export function generateMarketItems(now = Date.now()): MarketItem[] {
  return MARKET_ITEMS.map((def) => {
    const variance = randomInt(-2, 3);
    const quantity = Math.max(1, def.quantity + variance);
    const priceVariance = 1 + (randomInt(-10, 11) / 100);

    return {
      definitionId: def.id,
      itemId: def.itemId,
      name: def.name,
      price: Math.max(1, Math.round(def.price * priceVariance)),
      quantity,
      rarity: def.rarity,
      category: def.category
    };
  });
}

export function refreshMarket(state: MarketState, now = Date.now()): MarketState {
  const elapsed = now - state.lastRefreshedAt;

  if (elapsed < MARKET_REFRESH_INTERVAL_MS && state.items.length > 0) {
    return state;
  }

  return {
    items: generateMarketItems(now),
    lastRefreshedAt: now
  };
}

export interface BuyResult {
  save: GameSaveData;
  success: boolean;
  message: string;
}

export function buyItem(save: GameSaveData, marketItemId: string, quantity = 1): BuyResult {
  const marketItem = save.market.items.find((item) => item.definitionId === marketItemId);

  if (marketItem === undefined) {
    return { save, success: false, message: "商品不存在。" };
  }

  if (marketItem.quantity < quantity) {
    return { save, success: false, message: "库存不足。" };
  }

  const totalPrice = marketItem.price * quantity;

  if (save.player.spiritStones < totalPrice) {
    return { save, success: false, message: "灵石不足。" };
  }

  const updatedItems = save.market.items
    .map((item) => {
      if (item.definitionId === marketItemId) {
        return { ...item, quantity: item.quantity - quantity };
      }
      return item;
    })
    .filter((item) => item.quantity > 0);

  const nextSave: GameSaveData = {
    ...save,
    player: {
      ...save.player,
      spiritStones: save.player.spiritStones - totalPrice
    },
    inventory: addItem(save.inventory, marketItem.itemId, quantity),
    market: {
      ...save.market,
      items: updatedItems
    }
  };

  return {
    save: nextSave,
    success: true,
    message: `购买成功，获得 ${marketItem.name} x${quantity}。`
  };
}

export interface SellResult {
  save: GameSaveData;
  success: boolean;
  message: string;
}

export function sellItem(save: GameSaveData, itemId: string, quantity = 1): SellResult {
  const itemDef = ITEMS.find((def) => def.id === itemId);

  if (itemDef === undefined) {
    return { save, success: false, message: "物品不存在。" };
  }

  if (itemDef.category !== "material" && itemDef.category !== "consumable") {
    return { save, success: false, message: "该物品无法出售。" };
  }

  const inventoryItem =
    itemDef.category === "material"
      ? save.inventory.materials.find((item) => item.itemId === itemId)
      : save.inventory.consumables.find((item) => item.itemId === itemId);

  if (inventoryItem === undefined || inventoryItem.quantity < quantity) {
    return { save, success: false, message: "物品数量不足。" };
  }

  const marketDef = MARKET_ITEMS.find((def) => def.itemId === itemId);
  const basePrice = marketDef?.price ?? itemDef.value ?? 1;
  const sellPrice = Math.max(1, Math.floor(basePrice * SELL_PRICE_RATIO * quantity));

  let nextInventory = { ...save.inventory };

  if (itemDef.category === "material") {
    const newQuantity = inventoryItem.quantity - quantity;

    if (newQuantity <= 0) {
      nextInventory = {
        ...nextInventory,
        materials: nextInventory.materials.filter((item) => item.itemId !== itemId)
      };
    } else {
      nextInventory = {
        ...nextInventory,
        materials: nextInventory.materials.map((item) =>
          item.itemId === itemId ? { ...item, quantity: newQuantity } : item
        )
      };
    }
  } else {
    const newQuantity = inventoryItem.quantity - quantity;

    if (newQuantity <= 0) {
      nextInventory = {
        ...nextInventory,
        consumables: nextInventory.consumables.filter((item) => item.itemId !== itemId)
      };
    } else {
      nextInventory = {
        ...nextInventory,
        consumables: nextInventory.consumables.map((item) =>
          item.itemId === itemId ? { ...item, quantity: newQuantity } : item
        )
      };
    }
  }

  const nextSave: GameSaveData = {
    ...save,
    player: {
      ...save.player,
      spiritStones: save.player.spiritStones + sellPrice
    },
    inventory: nextInventory
  };

  return {
    save: nextSave,
    success: true,
    message: `出售成功，获得 ${sellPrice} 灵石。`
  };
}

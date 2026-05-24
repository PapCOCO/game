import { useState } from "react";
import type { GameSaveData, ItemStack, ItemType } from "../../game/types";
import { ITEMS } from "../../game/config";

type InventoryTab = "materials" | "consumables" | "currencies";

const TAB_LABELS: Record<InventoryTab, string> = {
  materials: "材料",
  consumables: "丹药",
  currencies: "杂项"
};

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  material: "材料",
  consumable: "丹药",
  currency: "杂项"
};

function getItemDefinition(itemId: string) {
  return ITEMS.find((item) => item.id === itemId);
}

function getStacks(save: GameSaveData, tab: InventoryTab): ItemStack[] {
  if (tab === "materials") {
    return save.inventory.materials;
  }

  if (tab === "consumables") {
    return save.inventory.consumables;
  }

  return save.inventory.currencies;
}

export function InventoryPanel({ save }: { save: GameSaveData }) {
  const [activeTab, setActiveTab] = useState<InventoryTab>("materials");
  const stacks = getStacks(save, activeTab);

  return (
    <section className="panel inventory-panel text-panel">
      <div className="panel-heading">
        <span className="eyebrow">行囊</span>
        <h2>背包</h2>
      </div>

      <div className="tab-row" role="tablist" aria-label="背包分类">
        {(Object.keys(TAB_LABELS) as InventoryTab[]).map((tab) => (
          <button
            className={tab === activeTab ? "tab-button tab-button-active" : "tab-button"}
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className="inventory-list-shell">
        <div className="inventory-ledger">
          <span>灵石</span>
          <strong>{save.player.spiritStones}</strong>
        </div>

        <div className="inventory-compact-list" aria-label="物品列表">
          {stacks.length === 0 ? (
            <p className="muted-text">此类物品尚无收获。</p>
          ) : (
            stacks.map((stack) => {
              const item = getItemDefinition(stack.itemId);

              return (
                <button
                  className="inventory-compact-row"
                  key={stack.itemId}
                  type="button"
                >
                  <span className="inventory-item-name">{item?.name ?? stack.itemId}</span>
                  <span className="inventory-item-meta">{item?.rarity ?? "未知"} · x{stack.quantity}</span>
                  <div className="item-hover-detail" role="tooltip">
                    <strong>{item?.name ?? stack.itemId}</strong>
                    <span>
                      {item === undefined ? "未知" : `${ITEM_TYPE_LABELS[item.type]} · ${item.rarity}`}
                    </span>
                    <span>数量：{stack.quantity}</span>
                    <p>{item?.description ?? "无描述。"}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

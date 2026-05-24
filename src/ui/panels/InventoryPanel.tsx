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

function getTooltipPosition(clientX: number, clientY: number) {
  return {
    x: Math.min(clientX + 16, window.innerWidth - 300),
    y: Math.min(clientY + 12, window.innerHeight - 170)
  };
}

export function InventoryPanel({ save }: { save: GameSaveData }) {
  const [activeTab, setActiveTab] = useState<InventoryTab>("materials");
  const [hoveredStack, setHoveredStack] = useState<ItemStack | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const stacks = getStacks(save, activeTab);
  const hoveredItem = hoveredStack === null ? undefined : getItemDefinition(hoveredStack.itemId);

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
                  onBlur={() => setHoveredStack(null)}
                  onFocus={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    setHoveredStack(stack);
                    setTooltipPosition(getTooltipPosition(rect.right, rect.top));
                  }}
                  onMouseEnter={(event) => {
                    setHoveredStack(stack);
                    setTooltipPosition(getTooltipPosition(event.clientX, event.clientY));
                  }}
                  onMouseLeave={() => setHoveredStack(null)}
                  onMouseMove={(event) => setTooltipPosition(getTooltipPosition(event.clientX, event.clientY))}
                >
                  <span className="inventory-item-name">{item?.name ?? stack.itemId}</span>
                  <span className="inventory-item-meta">{item?.rarity ?? "未知"} · x{stack.quantity}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {hoveredStack !== null ? (
        <div
          className="floating-item-detail"
          role="tooltip"
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          <strong>{hoveredItem?.name ?? hoveredStack.itemId}</strong>
          <span>
            {hoveredItem === undefined ? "未知" : `${ITEM_TYPE_LABELS[hoveredItem.type]} · ${hoveredItem.rarity}`}
          </span>
          <span>数量：{hoveredStack.quantity}</span>
          <p>{hoveredItem?.description ?? "无描述。"}</p>
        </div>
      ) : null}
    </section>
  );
}

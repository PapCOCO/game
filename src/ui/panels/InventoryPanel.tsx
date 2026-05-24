import { useState } from "react";
import type {
  EquipmentInstance,
  EquipmentSlot,
  GameSaveData,
  ItemStack,
  ItemType
} from "../../game/types";
import { ITEMS } from "../../game/config";
import { calculateEquipmentScore, formatEquipmentStats } from "../../game/core/equipment";
import { useGameStore } from "../../game/state/gameStore";

type InventoryTab = "materials" | "consumables" | "currencies" | "equipments";
type EquipmentFilter = "all" | EquipmentSlot;
type HoveredEntry =
  | { kind: "item"; stack: ItemStack }
  | { kind: "equipment"; equipment: EquipmentInstance }
  | null;

const TAB_LABELS: Record<InventoryTab, string> = {
  materials: "材料",
  consumables: "丹药",
  currencies: "杂项",
  equipments: "装备"
};

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  material: "材料",
  consumable: "丹药",
  currency: "杂项"
};

const SLOT_LABELS: Record<EquipmentInstance["slot"], string> = {
  weapon: "武器",
  armor: "护甲",
  amulet: "护符",
  ring: "戒指"
};

const EQUIPMENT_FILTER_LABELS: Record<EquipmentFilter, string> = {
  all: "全部",
  weapon: "武器",
  armor: "护甲",
  amulet: "护符",
  ring: "戒指"
};

function getItemDefinition(itemId: string) {
  return ITEMS.find((item) => item.id === itemId);
}

function getStacks(save: GameSaveData, tab: Exclude<InventoryTab, "equipments">): ItemStack[] {
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
    x: Math.min(clientX + 16, window.innerWidth - 310),
    y: Math.min(clientY + 12, window.innerHeight - 190)
  };
}

export function InventoryPanel({ save }: { save: GameSaveData }) {
  const { discardEquipment, equipItemNow } = useGameStore();
  const [activeTab, setActiveTab] = useState<InventoryTab>("materials");
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>("all");
  const [hoveredEntry, setHoveredEntry] = useState<HoveredEntry>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const equippedIds = new Set(Object.values(save.player.equipped));
  const unequippedEquipments = save.inventory.equipments.filter(
    (equipment) => !equippedIds.has(equipment.instanceId)
  );
  const visibleEquipments =
    equipmentFilter === "all"
      ? unequippedEquipments
      : unequippedEquipments.filter((equipment) => equipment.slot === equipmentFilter);
  const stacks = activeTab === "equipments" ? [] : getStacks(save, activeTab);
  const hoveredItem =
    hoveredEntry?.kind === "item" ? getItemDefinition(hoveredEntry.stack.itemId) : undefined;

  function showTooltip(entry: HoveredEntry, clientX: number, clientY: number) {
    setHoveredEntry(entry);
    setTooltipPosition(getTooltipPosition(clientX, clientY));
  }

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
            onClick={() => {
              setActiveTab(tab);
              setHoveredEntry(null);
            }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div
        className={
          activeTab === "equipments"
            ? "inventory-list-shell inventory-list-shell-equipment"
            : "inventory-list-shell"
        }
      >
        <div className="inventory-ledger">
          <span>灵石</span>
          <strong>{save.player.spiritStones}</strong>
        </div>

        {activeTab === "equipments" ? (
          <div className="subtab-row" role="tablist" aria-label="装备细分">
            {(Object.keys(EQUIPMENT_FILTER_LABELS) as EquipmentFilter[]).map((filter) => (
              <button
                className={filter === equipmentFilter ? "subtab-button subtab-button-active" : "subtab-button"}
                key={filter}
                type="button"
                onClick={() => {
                  setEquipmentFilter(filter);
                  setHoveredEntry(null);
                }}
              >
                {EQUIPMENT_FILTER_LABELS[filter]}
              </button>
            ))}
          </div>
        ) : null}

        <div className="inventory-compact-list" aria-label="物品列表">
          {activeTab === "equipments" ? (
            visibleEquipments.length === 0 ? (
              <p className="muted-text">没有未穿戴装备。</p>
            ) : (
              visibleEquipments.map((equipment) => (
                <div
                  className="inventory-compact-row equipment-backpack-row"
                  key={equipment.instanceId}
                >
                  <span
                    className="inventory-item-name inventory-hover-name"
                    onBlur={() => setHoveredEntry(null)}
                    onFocus={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      showTooltip({ kind: "equipment", equipment }, rect.right, rect.top);
                    }}
                    onMouseEnter={(event) =>
                      showTooltip({ kind: "equipment", equipment }, event.clientX, event.clientY)
                    }
                    onMouseLeave={() => setHoveredEntry(null)}
                    onMouseMove={(event) =>
                      showTooltip({ kind: "equipment", equipment }, event.clientX, event.clientY)
                    }
                    tabIndex={0}
                  >
                    {equipment.name}
                  </span>
                  <span className="inventory-item-meta">
                    {SLOT_LABELS[equipment.slot]} · {equipment.rarity} · {calculateEquipmentScore(equipment).toFixed(0)}
                  </span>
                  <div className="inventory-row-actions">
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => void equipItemNow(equipment.instanceId)}
                    >
                      穿
                    </button>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => void discardEquipment(equipment.instanceId)}
                    >
                      弃
                    </button>
                  </div>
                </div>
              ))
            )
          ) : stacks.length === 0 ? (
            <p className="muted-text">此类物品尚无收获。</p>
          ) : (
            stacks.map((stack) => {
              const item = getItemDefinition(stack.itemId);

              return (
                <div
                  className="inventory-compact-row"
                  key={stack.itemId}
                >
                  <span
                    className="inventory-item-name inventory-hover-name"
                    onBlur={() => setHoveredEntry(null)}
                    onFocus={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      showTooltip({ kind: "item", stack }, rect.right, rect.top);
                    }}
                    onMouseEnter={(event) =>
                      showTooltip({ kind: "item", stack }, event.clientX, event.clientY)
                    }
                    onMouseLeave={() => setHoveredEntry(null)}
                    onMouseMove={(event) => showTooltip({ kind: "item", stack }, event.clientX, event.clientY)}
                    tabIndex={0}
                  >
                    {item?.name ?? stack.itemId}
                  </span>
                  <span className="inventory-item-meta">{item?.rarity ?? "未知"} · x{stack.quantity}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {hoveredEntry !== null ? (
        <div
          className="floating-item-detail"
          role="tooltip"
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          {hoveredEntry.kind === "item" ? (
            <>
              <strong>{hoveredItem?.name ?? hoveredEntry.stack.itemId}</strong>
              <span>
                {hoveredItem === undefined
                  ? "未知"
                  : `${ITEM_TYPE_LABELS[hoveredItem.type]} · ${hoveredItem.rarity}`}
              </span>
              <span>数量：{hoveredEntry.stack.quantity}</span>
              <p>{hoveredItem?.description ?? "无描述。"}</p>
            </>
          ) : (
            <>
              <strong>{hoveredEntry.equipment.name}</strong>
              <span>
                {SLOT_LABELS[hoveredEntry.equipment.slot]} · {hoveredEntry.equipment.rarity} · 评分{" "}
                {calculateEquipmentScore(hoveredEntry.equipment).toFixed(1)}
              </span>
              <p>{formatEquipmentStats(hoveredEntry.equipment)}</p>
              <p>
                词条：
                {hoveredEntry.equipment.affixes.length > 0
                  ? hoveredEntry.equipment.affixes.map((affix) => affix.name).join("、")
                  : "无"}
              </p>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}

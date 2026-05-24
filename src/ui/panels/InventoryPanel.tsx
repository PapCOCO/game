import { useEffect, useState } from "react";
import type {
  EquipmentInstance,
  EquipmentSlot,
  GameSaveData,
  ItemStack,
  ItemType,
  Rarity
} from "../../game/types";
import { ITEMS, ENHANCEMENT_CONFIG, MAX_ENHANCEMENT_LEVEL } from "../../game/config";
import { calculateEquipmentScore, formatEquipmentStats } from "../../game/core/equipment";
import { canEnhance } from "../../game/core/enhancement";
import { useGameStore } from "../../game/state/gameStore";

type InventoryTab = "materials" | "consumables" | "currencies" | "equipments";
type EquipmentFilter = "all" | EquipmentSlot;
type EquipmentSort = "score" | "rarity" | "enhancement" | "createdAt";
type SelectedEntry =
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

const RARITY_LABELS: Record<string, string> = {
  common: "普通",
  uncommon: "优秀",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说"
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

const EQUIPMENT_SORT_LABELS: Record<EquipmentSort, string> = {
  score: "评分",
  rarity: "稀有度",
  enhancement: "强化",
  createdAt: "获得时间"
};

const RARITY_ORDER: Record<Rarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5
};

function getItemDefinition(itemId: string) {
  return ITEMS.find((item) => item.id === itemId);
}

function getItemName(itemId: string): string {
  return ITEMS.find((item) => item.id === itemId)?.name ?? itemId;
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

function getEnhancementDetail(equipment: EquipmentInstance): {
  costText: string;
  successRateText: string;
} | null {
  const enhancement = equipment.enhancement ?? 0;

  if (enhancement >= MAX_ENHANCEMENT_LEVEL) {
    return null;
  }

  const config = ENHANCEMENT_CONFIG[enhancement];

  if (config === undefined) {
    return null;
  }

  const materialText = config.materials
    .map((material) => `${getItemName(material.itemId)} x${material.quantity}`)
    .join("、");

  return {
    costText: `${config.spiritStoneCost} 灵石${materialText.length > 0 ? `、${materialText}` : ""}`,
    successRateText: `${(config.successRate * 100).toFixed(0)}%`
  };
}

function formatAffixes(equipment: EquipmentInstance): string {
  return equipment.affixes.length > 0
    ? equipment.affixes.map((affix) => affix.name).join("、")
    : "无";
}

function EquipmentDetail({
  equipment,
  save
}: {
  equipment: EquipmentInstance;
  save: GameSaveData;
}) {
  const { discardEquipment, equipItemNow, enhanceEquipmentNow } = useGameStore();
  const enhancement = equipment.enhancement ?? 0;
  const enhancementDetail = getEnhancementDetail(equipment);
  const canEnhanceThis = canEnhance(save, equipment.instanceId);

  return (
    <div className="inventory-detail-card">
      <div className="inventory-detail-header">
        <strong>
          {equipment.name}
          {enhancement > 0 ? ` +${enhancement}` : ""}
        </strong>
        <span>
          {SLOT_LABELS[equipment.slot]} · {RARITY_LABELS[equipment.rarity] ?? equipment.rarity} ·
          评分 {calculateEquipmentScore(equipment).toFixed(1)}
        </span>
      </div>
      <div className="inventory-detail-body">
        <p>属性：{formatEquipmentStats(equipment)}</p>
        <p>词条：{formatAffixes(equipment)}</p>
        {enhancementDetail === null ? (
          <p>强化：已达上限</p>
        ) : (
          <p>
            强化 +{enhancement + 1}：{enhancementDetail.costText} · 成功率{" "}
            {enhancementDetail.successRateText}
          </p>
        )}
      </div>
      <div className="inventory-detail-actions">
        <button
          className="text-button"
          type="button"
          onClick={() => void equipItemNow(equipment.instanceId)}
        >
          穿戴
        </button>
        <button
          className="text-button"
          disabled={enhancement >= MAX_ENHANCEMENT_LEVEL || !canEnhanceThis.can}
          title={canEnhanceThis.can ? enhancementDetail?.costText : canEnhanceThis.reason}
          type="button"
          onClick={() => void enhanceEquipmentNow(equipment.instanceId)}
        >
          强化
        </button>
        <button
          className="text-button"
          type="button"
          onClick={() => void discardEquipment(equipment.instanceId)}
        >
          丢弃
        </button>
      </div>
    </div>
  );
}

function ItemDetail({ stack }: { stack: ItemStack }) {
  const item = getItemDefinition(stack.itemId);

  return (
    <div className="inventory-detail-card">
      <div className="inventory-detail-header">
        <strong>{item?.name ?? stack.itemId}</strong>
        <span>
          {item === undefined
            ? "未知"
            : `${ITEM_TYPE_LABELS[item.type]} · ${RARITY_LABELS[item.rarity] ?? item.rarity}`}
        </span>
      </div>
      <div className="inventory-detail-body">
        <p>数量：{stack.quantity}</p>
        <p>{item?.description ?? "无描述。"}</p>
      </div>
    </div>
  );
}

export function InventoryPanel({ save }: { save: GameSaveData }) {
  const { cleanupLowScoreEquipments } = useGameStore();
  const [activeTab, setActiveTab] = useState<InventoryTab>("materials");
  const [equipmentFilter, setEquipmentFilter] = useState<EquipmentFilter>("all");
  const [equipmentSort, setEquipmentSort] = useState<EquipmentSort>("score");
  const [selectedEntry, setSelectedEntry] = useState<SelectedEntry>(null);
  const equippedIds = new Set(Object.values(save.player.equipped));
  const unequippedEquipments = save.inventory.equipments.filter(
    (equipment) => !equippedIds.has(equipment.instanceId)
  );
  const filteredEquipments =
    equipmentFilter === "all"
      ? unequippedEquipments
      : unequippedEquipments.filter((equipment) => equipment.slot === equipmentFilter);
  const visibleEquipments = [...filteredEquipments].sort((first, second) => {
    if (equipmentSort === "score") {
      return calculateEquipmentScore(second) - calculateEquipmentScore(first);
    }

    if (equipmentSort === "rarity") {
      return RARITY_ORDER[second.rarity] - RARITY_ORDER[first.rarity];
    }

    if (equipmentSort === "enhancement") {
      return (second.enhancement ?? 0) - (first.enhancement ?? 0);
    }

    return second.createdAt - first.createdAt;
  });
  const stacks = activeTab === "equipments" ? [] : getStacks(save, activeTab);

  function handleCleanupLowScore() {
    const confirmed = window.confirm("将丢弃未穿戴、未锁定、评分不高于 30 的装备，并保留稀有及以上装备，是否继续？");

    if (!confirmed) {
      return;
    }

    void cleanupLowScoreEquipments({
      maxScore: 30,
      keepRarityAtOrAbove: "rare"
    });
  }

  useEffect(() => {
    if (activeTab === "equipments") {
      const selectedEquipment =
        selectedEntry?.kind === "equipment"
          ? visibleEquipments.find(
              (equipment) => equipment.instanceId === selectedEntry.equipment.instanceId
            )
          : undefined;

      setSelectedEntry(
        selectedEquipment !== undefined
          ? { kind: "equipment", equipment: selectedEquipment }
          : visibleEquipments[0] !== undefined
            ? { kind: "equipment", equipment: visibleEquipments[0] }
            : null
      );
      return;
    }

    const selectedStack =
      selectedEntry?.kind === "item"
        ? stacks.find((stack) => stack.itemId === selectedEntry.stack.itemId)
        : undefined;

    setSelectedEntry(
      selectedStack !== undefined
        ? { kind: "item", stack: selectedStack }
        : stacks[0] !== undefined
          ? { kind: "item", stack: stacks[0] }
          : null
    );
  }, [activeTab, equipmentFilter, save.inventory, save.player.equipped]);

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
              setSelectedEntry(null);
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
          <div className="inventory-equipment-tools">
            <div className="subtab-row" role="tablist" aria-label="装备细分">
              {(Object.keys(EQUIPMENT_FILTER_LABELS) as EquipmentFilter[]).map((filter) => (
                <button
                  className={filter === equipmentFilter ? "subtab-button subtab-button-active" : "subtab-button"}
                  key={filter}
                  type="button"
                  onClick={() => {
                    setEquipmentFilter(filter);
                    setSelectedEntry(null);
                  }}
                >
                  {EQUIPMENT_FILTER_LABELS[filter]}
                </button>
              ))}
            </div>
            <div className="inventory-sort-row">
              <label>
                <span>排序</span>
                <select
                  value={equipmentSort}
                  onChange={(event) => setEquipmentSort(event.target.value as EquipmentSort)}
                >
                  {(Object.keys(EQUIPMENT_SORT_LABELS) as EquipmentSort[]).map((sort) => (
                    <option key={sort} value={sort}>
                      {EQUIPMENT_SORT_LABELS[sort]}
                    </option>
                  ))}
                </select>
              </label>
              <button className="text-button" type="button" onClick={handleCleanupLowScore}>
                清理低分装备
              </button>
            </div>
          </div>
        ) : null}

        <div className="inventory-browser">
          <div className="inventory-compact-list" aria-label="物品列表">
            {activeTab === "equipments" ? (
              visibleEquipments.length === 0 ? (
                <p className="muted-text">没有未穿戴装备。</p>
              ) : (
                visibleEquipments.map((equipment) => {
                  const enhancement = equipment.enhancement ?? 0;
                  const isSelected =
                    selectedEntry?.kind === "equipment" &&
                    selectedEntry.equipment.instanceId === equipment.instanceId;

                  return (
                    <button
                      className={
                        isSelected
                          ? "inventory-compact-row equipment-backpack-row inventory-selected-row"
                          : "inventory-compact-row equipment-backpack-row"
                      }
                      key={equipment.instanceId}
                      type="button"
                      onClick={() => setSelectedEntry({ kind: "equipment", equipment })}
                    >
                      <span className="inventory-item-name">
                        {equipment.name}
                        {enhancement > 0 ? ` +${enhancement}` : ""}
                      </span>
                      <span className="inventory-item-meta">
                        {SLOT_LABELS[equipment.slot]} · {RARITY_LABELS[equipment.rarity] ?? equipment.rarity} ·
                        评分 {calculateEquipmentScore(equipment).toFixed(0)}
                      </span>
                    </button>
                  );
                })
              )
            ) : stacks.length === 0 ? (
              <p className="muted-text">此类物品尚无收获。</p>
            ) : (
              stacks.map((stack) => {
                const item = getItemDefinition(stack.itemId);
                const isSelected =
                  selectedEntry?.kind === "item" &&
                  selectedEntry.stack.itemId === stack.itemId;

                return (
                  <button
                    className={
                      isSelected
                        ? "inventory-compact-row inventory-selected-row"
                        : "inventory-compact-row"
                    }
                    key={stack.itemId}
                    type="button"
                    onClick={() => setSelectedEntry({ kind: "item", stack })}
                  >
                    <span className="inventory-item-name">{item?.name ?? stack.itemId}</span>
                    <span className="inventory-item-meta">
                      {RARITY_LABELS[item?.rarity ?? ""] ?? item?.rarity ?? "未知"} · x{stack.quantity}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedEntry === null ? (
            <div className="inventory-detail-empty">选择一件物品查看详情。</div>
          ) : selectedEntry.kind === "item" ? (
            <ItemDetail stack={selectedEntry.stack} />
          ) : (
            <EquipmentDetail equipment={selectedEntry.equipment} save={save} />
          )}
        </div>
      </div>
    </section>
  );
}

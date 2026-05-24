import type { EquipmentInstance, EquipmentSlot, GameSaveData, ItemStack } from "../../game/types";
import { ITEMS } from "../../game/config";
import { calculateEquipmentScore, formatEquipmentStats } from "../../game/core/equipment";
import { useGameStore } from "../../game/state/gameStore";

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapon: "武器",
  armor: "护甲",
  amulet: "护符",
  ring: "戒指"
};

function getItemDefinition(itemId: string) {
  return ITEMS.find((item) => item.id === itemId);
}

function renderStacks(stacks: ItemStack[], emptyText: string) {
  if (stacks.length === 0) {
    return <p className="muted-text">{emptyText}</p>;
  }

  return (
    <div className="inventory-list">
      {stacks.map((stack) => {
        const item = getItemDefinition(stack.itemId);

        return (
          <div className={`inventory-row rarity-${item?.rarity ?? "common"}`} key={stack.itemId}>
            <div>
              <strong>{item?.name ?? stack.itemId}</strong>
              <small>{item?.rarity ?? "未知品质"}</small>
            </div>
            <strong>x{stack.quantity}</strong>
          </div>
        );
      })}
    </div>
  );
}

function EquipmentRow({
  equipment,
  isEquipped
}: {
  equipment: EquipmentInstance;
  isEquipped: boolean;
}) {
  const { discardEquipment, equipItemNow } = useGameStore();

  return (
    <div className={`equipment-item rarity-${equipment.rarity}`}>
      <div className="equipment-header">
        <strong>{equipment.name}</strong>
        <span>
          {SLOT_LABELS[equipment.slot]} · {equipment.rarity}
        </span>
      </div>

      <div className="equipment-meta-row">
        <small>评分 {calculateEquipmentScore(equipment).toFixed(1)}</small>
        <small>{isEquipped ? "已穿戴" : "背包中"}</small>
      </div>

      <p>{formatEquipmentStats(equipment)}</p>
      <small>
        {equipment.affixes.length > 0
          ? `词条：${equipment.affixes.map((affix) => affix.name).join("、")}`
          : "词条：无"}
      </small>

      <div className="equipment-actions">
        <button
          className="primary-button compact-button"
          disabled={isEquipped}
          type="button"
          onClick={() => void equipItemNow(equipment.instanceId)}
        >
          {isEquipped ? "已装备" : "装备"}
        </button>
        <button
          className="secondary-button compact-button"
          disabled={isEquipped}
          type="button"
          onClick={() => void discardEquipment(equipment.instanceId)}
        >
          丢弃
        </button>
      </div>
    </div>
  );
}

function renderEquipments(save: GameSaveData) {
  if (save.inventory.equipments.length === 0) {
    return <p className="muted-text">暂无装备。</p>;
  }

  const equippedIds = new Set(Object.values(save.player.equipped));

  return (
    <div className="equipment-list inventory-equipment-list">
      {save.inventory.equipments.map((equipment) => (
        <EquipmentRow
          equipment={equipment}
          isEquipped={equippedIds.has(equipment.instanceId)}
          key={equipment.instanceId}
        />
      ))}
    </div>
  );
}

export function InventoryPanel({ save }: { save: GameSaveData }) {
  return (
    <section className="panel inventory-panel">
      <div className="panel-heading">
        <span className="eyebrow">Inventory</span>
        <h2>背包</h2>
      </div>

      <div className="inventory-scroll">
        <div className="inventory-section">
          <h3>灵石</h3>
          <strong className="spirit-stone-count">{save.player.spiritStones}</strong>
        </div>

        <div className="inventory-section">
          <h3>材料</h3>
          {renderStacks(save.inventory.materials, "暂无材料。")}
        </div>

        <div className="inventory-section">
          <h3>消耗品</h3>
          {renderStacks(save.inventory.consumables, "暂无消耗品。")}
        </div>

        <div className="inventory-section">
          <h3>
            装备 {save.inventory.equipments.length}/{save.inventory.maxEquipmentCount}
          </h3>
          {renderEquipments(save)}
        </div>
      </div>
    </section>
  );
}

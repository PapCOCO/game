import type { CoreStats, EquipmentInstance, GameSaveData, ItemStack } from "../../game/types";
import { ITEMS } from "../../game/config";

const STAT_LABELS: Record<keyof CoreStats, string> = {
  attack: "攻击",
  defense: "防御",
  maxHp: "气血",
  cultivationSpeed: "修炼速度",
  spiritStoneBonus: "灵石加成"
};

const SLOT_LABELS: Record<EquipmentInstance["slot"], string> = {
  weapon: "武器",
  armor: "护甲",
  amulet: "护符",
  ring: "戒指"
};

function getItemName(itemId: string): string {
  return ITEMS.find((item) => item.id === itemId)?.name ?? itemId;
}

function renderStacks(stacks: ItemStack[], emptyText: string) {
  if (stacks.length === 0) {
    return <p className="muted-text">{emptyText}</p>;
  }

  return (
    <div className="inventory-list">
      {stacks.map((stack) => (
        <div className="inventory-row" key={stack.itemId}>
          <span>{getItemName(stack.itemId)}</span>
          <strong>x{stack.quantity}</strong>
        </div>
      ))}
    </div>
  );
}

function formatStatValue(stat: keyof CoreStats, value: number): string {
  if (stat === "spiritStoneBonus") {
    return `${(value * 100).toFixed(1)}%`;
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function formatBaseStats(stats: Partial<CoreStats>): string {
  const entries = Object.entries(stats) as Array<[keyof CoreStats, number]>;

  if (entries.length === 0) {
    return "无基础属性";
  }

  return entries
    .map(([stat, value]) => `${STAT_LABELS[stat]} +${formatStatValue(stat, value)}`)
    .join("、");
}

function renderEquipments(equipments: EquipmentInstance[]) {
  if (equipments.length === 0) {
    return <p className="muted-text">暂无装备。</p>;
  }

  return (
    <div className="equipment-list">
      {equipments.map((equipment) => (
        <div className={`equipment-item rarity-${equipment.rarity}`} key={equipment.instanceId}>
          <div className="equipment-header">
            <strong>{equipment.name}</strong>
            <span>
              {SLOT_LABELS[equipment.slot]} · {equipment.rarity}
            </span>
          </div>
          <p>{formatBaseStats(equipment.baseStats)}</p>
          <small>
            {equipment.affixes.length > 0
              ? `词条：${equipment.affixes.map((affix) => affix.name).join("、")}`
              : "词条：无"}
          </small>
        </div>
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
        {renderEquipments(save.inventory.equipments)}
      </div>
    </section>
  );
}

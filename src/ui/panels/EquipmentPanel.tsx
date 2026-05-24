import type { EquipmentSlot, GameSaveData } from "../../game/types";
import { calculateEquipmentScore, formatEquipmentStats } from "../../game/core/equipment";
import { getEquippedEquipment } from "../../game/core/selectors";
import { useGameStore } from "../../game/state/gameStore";

const EQUIPMENT_SLOTS: EquipmentSlot[] = ["weapon", "armor", "amulet", "ring"];

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapon: "武器",
  armor: "护甲",
  amulet: "护符",
  ring: "戒指"
};

export function EquipmentPanel({ save }: { save: GameSaveData }) {
  const { unequipSlotNow } = useGameStore();
  const equippedEquipment = getEquippedEquipment(save);

  return (
    <section className="panel equipment-panel">
      <div className="panel-heading">
        <span className="eyebrow">Equipment</span>
        <h2>已装备</h2>
      </div>

      <div className="equipment-slot-list">
        {EQUIPMENT_SLOTS.map((slot) => {
          const equipment = equippedEquipment[slot];

          return (
            <div className="equipment-slot" key={slot}>
              <div className="equipment-slot-header">
                <h3>{SLOT_LABELS[slot]}</h3>
                {equipment !== undefined ? (
                  <button
                    className="secondary-button compact-button"
                    type="button"
                    onClick={() => void unequipSlotNow(slot)}
                  >
                    卸下
                  </button>
                ) : null}
              </div>

              {equipment === undefined ? (
                <p className="muted-text">未装备。</p>
              ) : (
                <div className={`equipment-item compact-equipment rarity-${equipment.rarity}`}>
                  <div className="equipment-header">
                    <strong>{equipment.name}</strong>
                    <span>{equipment.rarity}</span>
                  </div>
                  <small>评分 {calculateEquipmentScore(equipment).toFixed(1)}</small>
                  <p>{formatEquipmentStats(equipment)}</p>
                  <small>
                    {equipment.affixes.length > 0
                      ? `词条：${equipment.affixes.map((affix) => affix.name).join("、")}`
                      : "词条：无"}
                  </small>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

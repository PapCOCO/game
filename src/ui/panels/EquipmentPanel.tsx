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
    <section className="panel equipment-panel text-panel">
      <div className="panel-heading">
        <span className="eyebrow">器物</span>
        <h2>当前穿戴</h2>
      </div>

      <div className="equipped-lines equipped-lines-only">
        {EQUIPMENT_SLOTS.map((slot) => {
          const equipment = equippedEquipment[slot];

          return (
            <div className="equipped-slot-card" key={slot}>
              <div className="equipped-line">
                <span>{SLOT_LABELS[slot]}</span>
                <strong>{equipment?.name ?? "空"}</strong>
                <button
                  className="text-button"
                  disabled={equipment === undefined}
                  type="button"
                  onClick={() => void unequipSlotNow(slot)}
                >
                  卸
                </button>
              </div>

              {equipment === undefined ? (
                <p className="muted-text">未穿戴。</p>
              ) : (
                <p>
                  评分 {calculateEquipmentScore(equipment).toFixed(0)} · {formatEquipmentStats(equipment)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

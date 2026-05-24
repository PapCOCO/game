import type { EquipmentSlot, GameSaveData } from "../../game/types";
import { calculateEquipmentScore, formatEquipmentStats } from "../../game/core/equipment";
import { getEquippedEquipment } from "../../game/core/selectors";
import { useGameStore } from "../../game/state/gameStore";
import { ENHANCEMENT_CONFIG, MAX_ENHANCEMENT_LEVEL } from "../../game/config";
import { canEnhance } from "../../game/core/enhancement";
import { ITEMS } from "../../game/config";

const EQUIPMENT_SLOTS: EquipmentSlot[] = ["weapon", "armor", "amulet", "ring"];

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapon: "武器",
  armor: "护甲",
  amulet: "护符",
  ring: "戒指"
};

function getItemName(itemId: string): string {
  return ITEMS.find((item) => item.id === itemId)?.name ?? itemId;
}

export function EquipmentPanel({ save }: { save: GameSaveData }) {
  const { unequipSlotNow, enhanceEquipmentNow } = useGameStore();
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
          const enhancement = equipment?.enhancement ?? 0;
          const canEnhanceThis = equipment !== undefined ? canEnhance(save, equipment.instanceId) : { can: false, reason: "" };

          return (
            <div className="equipped-slot-card" key={slot}>
              <div className="equipped-line">
                <span>{SLOT_LABELS[slot]}</span>
                <strong>
                  {equipment?.name ?? "空"}
                  {enhancement > 0 ? ` +${enhancement}` : ""}
                </strong>
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
                <div>
                  <p>
                    评分 {calculateEquipmentScore(equipment).toFixed(0)} · {formatEquipmentStats(equipment)}
                  </p>
                  {enhancement < MAX_ENHANCEMENT_LEVEL && (
                    <div style={{ marginTop: "8px" }}>
                      <div style={{ fontSize: "11px", color: "#879084", marginBottom: "4px" }}>
                        强化 +{enhancement + 1}: {ENHANCEMENT_CONFIG[enhancement].spiritStoneCost} 灵石
                        {ENHANCEMENT_CONFIG[enhancement].materials.map((m) => ` · ${m.quantity} ${getItemName(m.itemId)}`).join("")}
                        <span style={{ color: canEnhanceThis.can ? "#7fb3a0" : "#b95c4a" }}>
                          {" "}({(ENHANCEMENT_CONFIG[enhancement].successRate * 100).toFixed(0)}% 成功率)
                        </span>
                      </div>
                      <button
                        className="text-button"
                        disabled={!canEnhanceThis.can}
                        type="button"
                        onClick={() => void enhanceEquipmentNow(equipment.instanceId)}
                      >
                        强化
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

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

function getPrimaryStats(equipmentStats: string): string {
  const parts = equipmentStats.split("、").slice(0, 2);

  return parts.length > 0 ? parts.join("、") : "无属性";
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
          const enhancementConfig =
            equipment !== undefined && enhancement < MAX_ENHANCEMENT_LEVEL
              ? ENHANCEMENT_CONFIG[enhancement]
              : undefined;
          const enhancementTitle =
            enhancementConfig === undefined
              ? canEnhanceThis.reason
              : [
                  `${enhancementConfig.spiritStoneCost} 灵石`,
                  ...enhancementConfig.materials.map(
                    (material) => `${getItemName(material.itemId)} x${material.quantity}`
                  ),
                  `${(enhancementConfig.successRate * 100).toFixed(0)}% 成功率`
                ].join(" · ");

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
                <div className="equipped-slot-summary">
                  <p>评分 {calculateEquipmentScore(equipment).toFixed(0)}</p>
                  <p>{getPrimaryStats(formatEquipmentStats(equipment))}</p>
                  {enhancement < MAX_ENHANCEMENT_LEVEL && (
                    <div className="equipped-slot-actions">
                      <button
                        className="text-button"
                        disabled={!canEnhanceThis.can}
                        title={enhancementTitle}
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

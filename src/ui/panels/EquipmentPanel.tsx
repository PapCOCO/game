import { useEffect, useState } from "react";
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

function formatEquippedName(name: string, enhancement: number): string {
  return enhancement > 0 ? `${name} +${enhancement}` : name;
}

export function EquipmentPanel({ save }: { save: GameSaveData }) {
  const { unequipSlotNow, enhanceEquipmentNow } = useGameStore();
  const equippedEquipment = getEquippedEquipment(save);
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot>("weapon");
  const selectedEquipment = equippedEquipment[selectedSlot];

  useEffect(() => {
    if (equippedEquipment[selectedSlot] !== undefined) {
      return;
    }

    const firstEquippedSlot = EQUIPMENT_SLOTS.find((slot) => equippedEquipment[slot] !== undefined);

    if (firstEquippedSlot !== undefined) {
      setSelectedSlot(firstEquippedSlot);
    }
  }, [equippedEquipment, selectedSlot]);

  const selectedEnhancement = selectedEquipment?.enhancement ?? 0;
  const selectedCanEnhance =
    selectedEquipment !== undefined
      ? canEnhance(save, selectedEquipment.instanceId)
      : { can: false, reason: "" };
  const selectedEnhancementConfig =
    selectedEquipment !== undefined && selectedEnhancement < MAX_ENHANCEMENT_LEVEL
      ? ENHANCEMENT_CONFIG[selectedEnhancement]
      : undefined;
  const selectedEnhancementTitle =
    selectedEnhancementConfig === undefined
      ? selectedCanEnhance.reason
      : [
          `${selectedEnhancementConfig.spiritStoneCost} 灵石`,
          ...selectedEnhancementConfig.materials.map(
            (material) => `${getItemName(material.itemId)} x${material.quantity}`
          ),
          `${(selectedEnhancementConfig.successRate * 100).toFixed(0)}% 成功率`
        ].join(" · ");

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
          const isSelected = selectedSlot === slot;

          return (
            <div
              className={isSelected ? "equipped-line equipped-line-selected" : "equipped-line"}
              key={slot}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedSlot(slot)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedSlot(slot);
                }
              }}
            >
              <span>{SLOT_LABELS[slot]}</span>
              <strong>
                {equipment === undefined
                  ? "空"
                  : formatEquippedName(equipment.name, enhancement)}
              </strong>
              {equipment === undefined ? (
                <em>未穿戴</em>
              ) : (
                <>
                  <em>{getPrimaryStats(formatEquipmentStats(equipment))}</em>
                  <small>评分 {calculateEquipmentScore(equipment).toFixed(0)}</small>
                </>
              )}
              {equipment !== undefined ? (
                <button
                  className="text-button"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedSlot(slot);
                    void unequipSlotNow(slot);
                  }}
                >
                  卸
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="equipped-detail">
        {selectedEquipment === undefined ? (
          <p className="muted-text">此部位尚未穿戴装备。</p>
        ) : (
          <>
            <div className="equipped-detail-header">
              <strong>{formatEquippedName(selectedEquipment.name, selectedEnhancement)}</strong>
              <span>
                {SLOT_LABELS[selectedEquipment.slot]} · 评分{" "}
                {calculateEquipmentScore(selectedEquipment).toFixed(1)}
              </span>
            </div>
            <p>属性：{formatEquipmentStats(selectedEquipment)}</p>
            <p>
              词条：
              {selectedEquipment.affixes.length > 0
                ? selectedEquipment.affixes.map((affix) => affix.name).join("、")
                : "无"}
            </p>
            <div className="equipped-detail-actions">
              <button
                className="text-button"
                type="button"
                onClick={() => void unequipSlotNow(selectedEquipment.slot)}
              >
                卸下
              </button>
              {selectedEnhancement < MAX_ENHANCEMENT_LEVEL ? (
                <button
                  className="text-button"
                  disabled={!selectedCanEnhance.can}
                  title={selectedEnhancementTitle}
                  type="button"
                  onClick={() => void enhanceEquipmentNow(selectedEquipment.instanceId)}
                >
                  强化
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

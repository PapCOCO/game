import { useMemo, useState } from "react";
import type { EquipmentInstance, EquipmentSlot, GameSaveData } from "../../game/types";
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

function EquipmentLine({
  equipment,
  isSelected,
  onSelect
}: {
  equipment: EquipmentInstance;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={isSelected ? "text-list-row text-list-row-active" : "text-list-row"}
      type="button"
      onClick={onSelect}
    >
      <span>{equipment.name}</span>
      <small>
        {SLOT_LABELS[equipment.slot]} · {equipment.rarity} · {calculateEquipmentScore(equipment).toFixed(0)}
      </small>
    </button>
  );
}

export function EquipmentPanel({ save }: { save: GameSaveData }) {
  const { discardEquipment, equipItemNow, unequipSlotNow } = useGameStore();
  const equippedEquipment = getEquippedEquipment(save);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const equippedIds = useMemo(() => new Set(Object.values(save.player.equipped)), [save.player.equipped]);
  const selectedEquipment =
    save.inventory.equipments.find((equipment) => equipment.instanceId === selectedId) ??
    save.inventory.equipments[0];

  return (
    <section className="panel equipment-panel text-panel">
      <div className="panel-heading">
        <span className="eyebrow">器物</span>
        <h2>装备</h2>
      </div>

      <div className="equipment-text-layout">
        <div className="text-section">
          <h3>当前穿戴</h3>
          <div className="equipped-lines">
            {EQUIPMENT_SLOTS.map((slot) => {
              const equipment = equippedEquipment[slot];

              return (
                <div className="equipped-line" key={slot}>
                  <span>{SLOT_LABELS[slot]}</span>
                  <button
                    className="equipped-name-button"
                    disabled={equipment === undefined}
                    type="button"
                    onClick={() => {
                      if (equipment !== undefined) {
                        setSelectedId(equipment.instanceId);
                      }
                    }}
                  >
                    {equipment?.name ?? "空"}
                  </button>
                  <button
                    className="text-button"
                    disabled={equipment === undefined}
                    type="button"
                    onClick={() => void unequipSlotNow(slot)}
                  >
                    卸
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-split">
          <div className="text-list" aria-label="装备列表">
            {save.inventory.equipments.length === 0 ? (
              <p className="muted-text">行囊中尚无可用装备。</p>
            ) : (
              save.inventory.equipments.map((equipment) => (
                <EquipmentLine
                  equipment={equipment}
                  isSelected={equipment.instanceId === selectedEquipment?.instanceId}
                  key={equipment.instanceId}
                  onSelect={() => setSelectedId(equipment.instanceId)}
                />
              ))
            )}
          </div>

          <div className="text-detail">
            {selectedEquipment === undefined ? (
              <p className="muted-text">选择一件装备查看详情。</p>
            ) : (
              <>
                <h3>{selectedEquipment.name}</h3>
                <p>
                  {SLOT_LABELS[selectedEquipment.slot]} · {selectedEquipment.rarity} · 评分{" "}
                  {calculateEquipmentScore(selectedEquipment).toFixed(1)}
                </p>
                <div className="detail-actions detail-actions-top">
                  <button
                    className="primary-button compact-button"
                    disabled={equippedIds.has(selectedEquipment.instanceId)}
                    type="button"
                    onClick={() => void equipItemNow(selectedEquipment.instanceId)}
                  >
                    {equippedIds.has(selectedEquipment.instanceId) ? "已穿戴" : "穿戴"}
                  </button>
                  <button
                    className="secondary-button compact-button"
                    disabled={equippedIds.has(selectedEquipment.instanceId)}
                    type="button"
                    onClick={() => void discardEquipment(selectedEquipment.instanceId)}
                  >
                    丢弃
                  </button>
                </div>
                <p>{formatEquipmentStats(selectedEquipment)}</p>
                <p>
                  词条：
                  {selectedEquipment.affixes.length > 0
                    ? selectedEquipment.affixes.map((affix) => affix.name).join("、")
                    : "无"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

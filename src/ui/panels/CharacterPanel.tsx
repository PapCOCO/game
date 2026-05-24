import { useState } from "react";
import type { GameSaveData } from "../../game/types";
import { TECHNIQUES } from "../../game/config/techniques";
import {
  calculateFinalStats,
  getCurrentMap,
  getCurrentRealm,
  getPlayerPower
} from "../../game/core/selectors";
import { getCultivationGainPerSecond } from "../../game/core/cultivation";
import { StatBlock } from "../components/StatBlock";

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

const STAT_TOOLTIPS = {
  attack: {
    description: "影响你对敌人造成的伤害。攻击越高，伤害越大。",
    formula: "伤害 = (攻击 - 防御 × 0.45) × 随机系数(0.9~1.1)\n最低伤害 = 1",
    howToImprove: "• 提升境界\n• 穿戴武器\n• 装备词缀加成"
  },
  defense: {
    description: "减少你受到的伤害。防御越高，敌人对你的伤害越低。",
    formula: "伤害减免 = 防御 × 0.45\n实际伤害 = 敌人攻击 - 伤害减免",
    howToImprove: "• 提升境界\n• 穿戴防具\n• 装备词缀加成"
  },
  maxHp: {
    description: "你的最大生命值。气血越高，生存能力越强。",
    formula: "最大气血 = 基础 + 境界加成 + 装备加成 + 词缀加成",
    howToImprove: "• 提升境界\n• 穿戴防具/护符\n• 装备词缀加成"
  },
  speed: {
    description: "影响你的行动速度。速度越高，战斗回合中出手越快。",
    formula: "行动速度 = 20 + 速度\n满进度时间 = 100 ÷ 行动速度",
    howToImprove: "• 提升境界\n• 穿戴增加速度的装备\n• 装备词缀加成"
  },
  cultivationSpeed: {
    description: "影响你的修炼速度。修炼速度越高，境界突破越快。",
    formula: "每秒修为 = 1 × 修炼效率\n修炼效率 = 基础 × 境界加成 × 装备加成",
    howToImprove: "• 提升境界\n• 穿戴增加修炼速度的装备\n• 装备词缀加成"
  },
  spiritStoneBonus: {
    description: "增加灵石掉落收益。灵石收益越高，战斗获得的灵石越多。",
    formula: "实际收益 = 基础掉落 × (1 + 灵石加成)",
    howToImprove: "• 提升境界（每层+2%）\n• 穿戴戒指\n• 装备词缀加成"
  },
  power: {
    description: "综合战力评估，反映你的整体实力。战力越高，实力越强。",
    formula: "战力 = 攻击×2 + 防御×1.5 + 气血×0.2 + 速度×1.2",
    howToImprove: "• 平衡提升各项属性\n• 境界越高，战力越强\n• 装备词缀综合加成"
  },
  cultivation: {
    description: "当前修炼进度。修炼进度达到要求后可以尝试突破境界。",
    formula: "进度 = 当前修为 ÷ 突破需求\n突破成功率由境界决定",
    howToImprove: "• 挂机历练自动修炼\n• 提升修炼速度属性\n• 穿戴增加修炼速度的装备"
  },
  realm: {
    description: "当前境界。境界越高，基础属性越强，可探索的地图越多。",
    formula: "境界属性 = 基础属性 + 境界加成\n境界越高，所有基础属性越高",
    howToImprove: "• 积累修为\n• 突破到更高境界\n• 突破失败会降低成功率"
  }
};

const TECHNIQUE_CATEGORY_LABELS: Record<string, string> = {
  body: "炼体",
  sword: "剑诀",
  mind: "心法",
  movement: "身法"
};

export function CharacterPanel({ save }: { save: GameSaveData }) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const realm = getCurrentRealm(save);
  const currentMap = getCurrentMap(save);
  const finalStats = calculateFinalStats(save);
  const power = getPlayerPower(save);
  const maxHp = Math.max(1, finalStats.maxHp);
  const currentHp = Math.min(save.autoBattle.playerCurrentHp ?? maxHp, maxHp);
  const cultivationGain = getCultivationGainPerSecond(save);

  return (
    <section className="panel character-panel compact-character-panel">
      <div className="compact-panel-heading">
        <div>
          <span className="eyebrow">Character</span>
          <h2>{save.player.name}</h2>
        </div>
        <button
          className="secondary-button compact-button"
          type="button"
          onClick={() => setIsDetailOpen(true)}
        >
          详情
        </button>
      </div>

      <div className="compact-character-summary">
        <StatBlock label="境界" value={realm?.name ?? "未知"} tooltip={STAT_TOOLTIPS.realm} />
        <StatBlock label="战力" value={formatNumber(power)} tooltip={STAT_TOOLTIPS.power} />
        <StatBlock label="灵石" value={save.player.spiritStones} />
      </div>

      <div className="compact-overview-row">
        <span title="当前地图">图 {currentMap?.name ?? save.map.currentMapId}</span>
        <span title="当前气血">
          血 {formatNumber(currentHp)} / {formatNumber(maxHp)}
        </span>
      </div>

      <div className="compact-stat-row">
        <span title="攻击">攻 {formatNumber(finalStats.attack)}</span>
        <span title="防御">防 {formatNumber(finalStats.defense)}</span>
        <span title="速度">速 {formatNumber(finalStats.speed)}</span>
        <span title="修炼速度">修 {formatNumber(cultivationGain)}/秒</span>
      </div>

      {isDetailOpen ? (
        <div className="modal-backdrop" role="presentation">
          <section className="detail-modal" role="dialog" aria-modal="true" aria-label="角色详情">
            <div className="escape-menu-header">
              <div>
                <span className="eyebrow">Details</span>
                <h2>角色详情</h2>
              </div>
              <button
                className="secondary-button compact-button"
                type="button"
                onClick={() => setIsDetailOpen(false)}
              >
                关闭
              </button>
            </div>

            <div className="detail-stat-grid">
              <StatBlock label="攻击" value={formatNumber(finalStats.attack)} tooltip={STAT_TOOLTIPS.attack} />
              <StatBlock label="防御" value={formatNumber(finalStats.defense)} tooltip={STAT_TOOLTIPS.defense} />
              <StatBlock label="气血" value={formatNumber(finalStats.maxHp)} tooltip={STAT_TOOLTIPS.maxHp} />
              <StatBlock label="速度" value={formatNumber(finalStats.speed)} tooltip={STAT_TOOLTIPS.speed} />
              <StatBlock label="修炼速度" value={formatNumber(finalStats.cultivationSpeed)} tooltip={STAT_TOOLTIPS.cultivationSpeed} />
              <StatBlock label="灵石收益" value={formatPercent(finalStats.spiritStoneBonus)} tooltip={STAT_TOOLTIPS.spiritStoneBonus} />
              <StatBlock label="当前境界" value={realm?.name ?? save.player.realmId} tooltip={STAT_TOOLTIPS.realm} />
              <StatBlock label="当前地图" value={currentMap?.name ?? save.map.currentMapId} />
              <StatBlock label="击杀数量" value={save.autoBattle.defeatedCount} />
            </div>

            <div className="technique-detail-section">
              <h3>功法参悟</h3>
              <div className="technique-list">
                {TECHNIQUES.map((technique) => {
                  const progress = save.techniques.progress.find((entry) => entry.definitionId === technique.id);
                  const fragments = progress?.fragments ?? 0;
                  const learned = progress?.learned ?? false;

                  return (
                    <div className={learned ? "technique-row technique-learned" : "technique-row"} key={technique.id}>
                      <div>
                        <strong>{technique.name}</strong>
                        <span>{TECHNIQUE_CATEGORY_LABELS[technique.category]} · {technique.rarity}</span>
                      </div>
                      <p>{technique.description}</p>
                      <small>
                        {learned ? "已参悟" : `残页 ${fragments} / ${technique.requiredFragments}`}
                      </small>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

import type {
  BattleEnemyState,
  CoreStats,
  GameSaveData,
  MonsterDefinition
} from "../types";
import { MAPS, MONSTERS } from "../config";
import { calculateFinalStats } from "./selectors";
import { pickWeighted, randomFloat } from "./random";

export type BattleRoundSummary = {
  type: "none" | "player_attack" | "enemy_defeated" | "player_defeated" | "recovering";
  message: string;
  playerDamage?: number;
  enemyDamage?: number;
  monsterId?: string;
  monsterName?: string;
};

const RECOVERY_DURATION_MS = 5000;

export function calculateCombatPower(stats: CoreStats): number {
  return stats.attack * 2 + stats.defense * 1.5 + stats.maxHp * 0.2;
}

export function createEnemyFromMonster(monsterId: string): BattleEnemyState | null {
  const monster = MONSTERS.find((entry) => entry.id === monsterId);

  if (monster === undefined) {
    return null;
  }

  const maxHp = monster.maxHp > 0 ? monster.maxHp : monster.stats.maxHp;

  return {
    monsterId: monster.id,
    currentHp: maxHp,
    maxHp
  };
}

export function pickMonsterForCurrentMap(save: GameSaveData): MonsterDefinition | null {
  const currentMap = MAPS.find((map) => map.id === save.map.currentMapId);

  if (currentMap === undefined) {
    return null;
  }

  const monsterId = pickWeighted(currentMap.monsterPool);

  if (monsterId === null) {
    return null;
  }

  return MONSTERS.find((monster) => monster.id === monsterId) ?? null;
}

export function calculateDamage(attackerStats: CoreStats, defenderStats: CoreStats): number {
  const baseDamage = attackerStats.attack - defenderStats.defense * 0.45;
  const damage = Math.round(baseDamage * randomFloat(0.9, 1.1));

  return Math.max(1, damage);
}

function getMonsterForEnemy(enemy: BattleEnemyState | undefined): MonsterDefinition | undefined {
  return enemy === undefined ? undefined : MONSTERS.find((monster) => monster.id === enemy.monsterId);
}

export function ensureBattleState(save: GameSaveData, now = Date.now()): GameSaveData {
  const finalStats = calculateFinalStats(save);
  const maxPlayerHp = Math.max(1, finalStats.maxHp);
  const recoveringUntil = save.autoBattle.recoveringUntil;
  const isRecovering = recoveringUntil !== undefined && recoveringUntil > now;
  const currentEnemyMonster = getMonsterForEnemy(save.autoBattle.currentEnemy);
  const currentEnemy =
    save.autoBattle.currentEnemy !== undefined && currentEnemyMonster !== undefined
      ? {
          ...save.autoBattle.currentEnemy,
          currentHp: Math.min(
            Math.max(0, save.autoBattle.currentEnemy.currentHp),
            save.autoBattle.currentEnemy.maxHp
          )
        }
      : undefined;
  const nextPlayerHp =
    save.autoBattle.playerCurrentHp === undefined ||
    (!isRecovering && save.autoBattle.playerCurrentHp <= 0)
      ? maxPlayerHp
      : Math.min(Math.max(0, save.autoBattle.playerCurrentHp), maxPlayerHp);

  let nextEnemy = currentEnemy;

  if (nextEnemy === undefined && !isRecovering) {
    const monster = pickMonsterForCurrentMap(save);
    nextEnemy = monster === null ? undefined : createEnemyFromMonster(monster.id) ?? undefined;
  }

  return {
    ...save,
    player: {
      ...save.player,
      finalStats
    },
    autoBattle: {
      ...save.autoBattle,
      currentEnemy: nextEnemy,
      playerCurrentHp: nextPlayerHp
    }
  };
}

export function resolveBattleRound(
  save: GameSaveData,
  now = Date.now()
): { save: GameSaveData; summary: BattleRoundSummary } {
  if (!save.autoBattle.enabled) {
    return {
      save,
      summary: {
        type: "none",
        message: "自动历练已暂停。"
      }
    };
  }

  let nextSave = ensureBattleState(save, now);
  const finalStats = calculateFinalStats(nextSave);
  const maxPlayerHp = Math.max(1, finalStats.maxHp);
  const recoveringUntil = nextSave.autoBattle.recoveringUntil;

  if (recoveringUntil !== undefined && recoveringUntil > now) {
    return {
      save: nextSave,
      summary: {
        type: "recovering",
        message: "调息恢复中。"
      }
    };
  }

  if (recoveringUntil !== undefined && recoveringUntil <= now) {
    nextSave = {
      ...nextSave,
      autoBattle: {
        ...nextSave.autoBattle,
        playerCurrentHp: maxPlayerHp,
        recoveringUntil: undefined
      }
    };
    nextSave = ensureBattleState(nextSave, now);
  }

  const enemy = nextSave.autoBattle.currentEnemy;
  const monster = getMonsterForEnemy(enemy);

  if (enemy === undefined || monster === undefined) {
    return {
      save: nextSave,
      summary: {
        type: "none",
        message: "正在寻找敌人。"
      }
    };
  }

  const playerDamage = calculateDamage(finalStats, monster.stats);
  const enemyHpAfterAttack = Math.max(0, enemy.currentHp - playerDamage);

  if (enemyHpAfterAttack <= 0) {
    return {
      save: {
        ...nextSave,
        autoBattle: {
          ...nextSave.autoBattle,
          currentEnemy: {
            ...enemy,
            currentHp: 0
          },
          playerCurrentHp: nextSave.autoBattle.playerCurrentHp ?? maxPlayerHp
        }
      },
      summary: {
        type: "enemy_defeated",
        message: `你攻击 ${monster.name}，造成 ${playerDamage} 伤害，并将其击败。`,
        playerDamage,
        monsterId: monster.id,
        monsterName: monster.name
      }
    };
  }

  const enemyDamage = calculateDamage(monster.stats, finalStats);
  const playerHpAfterCounter = Math.max(
    0,
    (nextSave.autoBattle.playerCurrentHp ?? maxPlayerHp) - enemyDamage
  );

  if (playerHpAfterCounter <= 0) {
    return {
      save: {
        ...nextSave,
        autoBattle: {
          ...nextSave.autoBattle,
          currentEnemy: undefined,
          playerCurrentHp: 0,
          recoveringUntil: now + RECOVERY_DURATION_MS
        }
      },
      summary: {
        type: "player_defeated",
        message: `你攻击 ${monster.name}，造成 ${playerDamage} 伤害；${monster.name} 反击造成 ${enemyDamage} 伤害，你正在调息恢复。`,
        playerDamage,
        enemyDamage,
        monsterId: monster.id,
        monsterName: monster.name
      }
    };
  }

  return {
    save: {
      ...nextSave,
      autoBattle: {
        ...nextSave.autoBattle,
        currentEnemy: {
          ...enemy,
          currentHp: enemyHpAfterAttack
        },
        playerCurrentHp: playerHpAfterCounter
      }
    },
    summary: {
      type: "player_attack",
      message: `你攻击 ${monster.name}，造成 ${playerDamage} 伤害；${monster.name} 反击造成 ${enemyDamage} 伤害。`,
      playerDamage,
      enemyDamage,
      monsterId: monster.id,
      monsterName: monster.name
    }
  };
}

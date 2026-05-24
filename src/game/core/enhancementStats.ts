import type { CoreStats } from "../types";
import { ENHANCEMENT_CONFIG } from "../config";

export function getEnhancementStats(
  baseStats: Partial<CoreStats>,
  enhancement = 0
): Partial<CoreStats> {
  if (enhancement <= 0) {
    return baseStats;
  }

  const config = ENHANCEMENT_CONFIG[enhancement - 1];

  if (config === undefined) {
    return baseStats;
  }

  const result: Partial<CoreStats> = {};

  for (const [stat, value] of Object.entries(baseStats) as Array<[keyof CoreStats, number]>) {
    result[stat] = Math.round(value * config.attributeMultiplier * 100) / 100;
  }

  return result;
}

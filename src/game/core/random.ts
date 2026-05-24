import type { WeightedEntry } from "../types";

export function randomInt(min: number, max: number): number {
  const lower = Math.ceil(Math.min(min, max));
  const upper = Math.floor(Math.max(min, max));

  return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

export function randomFloat(min: number, max: number): number {
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);

  return Math.random() * (upper - lower) + lower;
}

export function pickWeighted<T>(entries: WeightedEntry<T>[]): T | null {
  const validEntries = entries.filter((entry) => entry.weight > 0);
  const totalWeight = validEntries.reduce((total, entry) => total + entry.weight, 0);

  if (totalWeight <= 0) {
    return null;
  }

  let roll = randomFloat(0, totalWeight);

  for (const entry of validEntries) {
    roll -= entry.weight;

    if (roll <= 0) {
      return entry.value;
    }
  }

  return validEntries.at(-1)?.value ?? null;
}

export function createId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 10);

  return `${prefix}_${Date.now().toString(36)}_${randomPart}`;
}

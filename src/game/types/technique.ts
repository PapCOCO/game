import type { ID, Rarity } from "./common";
import type { StatModifier } from "./stats";

export type TechniqueCategory = "body" | "sword" | "mind" | "movement";

export interface TechniqueDefinition {
  id: ID;
  name: string;
  category: TechniqueCategory;
  rarity: Rarity;
  description: string;
  requiredFragments: number;
  modifiers: StatModifier[];
}

export interface TechniqueProgress {
  definitionId: ID;
  fragments: number;
  learned: boolean;
}

export interface TechniqueState {
  progress: TechniqueProgress[];
}

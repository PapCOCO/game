export type ObjectiveType =
  | "defeat"
  | "cultivation"
  | "breakthrough"
  | "enhance"
  | "collect"
  | "alchemy"
  | "estate"
  | "equip";

export interface ObjectiveDefinition {
  id: string;
  title: string;
  description: string;
  type: ObjectiveType;
  target: number;
  reward: {
    spiritStones?: number;
    cultivation?: number;
    items?: Array<{ itemId: string; quantity: number }>;
  };
}

export interface ObjectiveProgress {
  definitionId: string;
  current: number;
  completed: boolean;
  claimed: boolean;
}

export interface ObjectiveState {
  progress: ObjectiveProgress[];
}

import type { GameSaveData } from "../types";
import { CURRENT_SAVE_VERSION } from "./saveVersion";
import { validateSaveData } from "./validateSave";

export function migrateSaveData(input: unknown): GameSaveData | null {
  if (!validateSaveData(input)) {
    return null;
  }

  if (input.version !== CURRENT_SAVE_VERSION) {
    return null;
  }

  return {
    ...input,
    autoBattle: {
      ...input.autoBattle,
      enabled: true,
      defeatedCount: input.autoBattle.defeatedCount ?? 0
    }
  };
}

import type { GameLogEntry, GameSaveData, TechniqueProgress, TechniqueState } from "../types";
import { TECHNIQUES } from "../config/techniques";
import { createId } from "./random";

export function createInitialTechniqueState(): TechniqueState {
  return {
    progress: TECHNIQUES.map((technique) => ({
      definitionId: technique.id,
      fragments: 0,
      learned: false
    }))
  };
}

export function normalizeTechniqueState(input: Partial<TechniqueState> | undefined): TechniqueState {
  const existingProgress = input?.progress ?? [];

  return {
    progress: TECHNIQUES.map((technique) => {
      const existing = existingProgress.find((entry) => entry.definitionId === technique.id);
      const fragments = Math.max(0, existing?.fragments ?? 0);

      return {
        definitionId: technique.id,
        fragments,
        learned: existing?.learned ?? fragments >= technique.requiredFragments
      };
    })
  };
}

export function getTechniqueProgress(save: GameSaveData, techniqueId: string): TechniqueProgress | undefined {
  return save.techniques.progress.find((entry) => entry.definitionId === techniqueId);
}

export function getLearnedTechniques(save: GameSaveData) {
  return save.techniques.progress
    .filter((entry) => entry.learned)
    .map((entry) => TECHNIQUES.find((technique) => technique.id === entry.definitionId))
    .filter((technique): technique is NonNullable<typeof technique> => technique !== undefined);
}

export function addTechniqueFragments(
  save: GameSaveData,
  fragments: Array<{ techniqueId: string; quantity: number }>,
  now = Date.now()
): { save: GameSaveData; learnedNames: string[] } {
  const learnedNames: string[] = [];
  let progress = save.techniques.progress;

  for (const fragment of fragments) {
    const technique = TECHNIQUES.find((entry) => entry.id === fragment.techniqueId);

    if (technique === undefined || fragment.quantity <= 0) {
      continue;
    }

    const existing = progress.find((entry) => entry.definitionId === fragment.techniqueId);
    const nextFragments = Math.min(
      technique.requiredFragments,
      (existing?.fragments ?? 0) + fragment.quantity
    );
    const learned = existing?.learned === true || nextFragments >= technique.requiredFragments;

    if (learned && existing?.learned !== true) {
      learnedNames.push(technique.name);
    }

    if (existing === undefined) {
      progress = [
        ...progress,
        {
          definitionId: fragment.techniqueId,
          fragments: nextFragments,
          learned
        }
      ];
    } else {
      progress = progress.map((entry) =>
        entry.definitionId === fragment.techniqueId
          ? { ...entry, fragments: nextFragments, learned }
          : entry
      );
    }
  }

  let nextSave: GameSaveData = {
    ...save,
    techniques: {
      progress
    }
  };

  if (learnedNames.length > 0) {
    const entry: GameLogEntry = {
      id: createId("log"),
      type: "technique",
      message: `参悟功法：${learnedNames.join("、")}。`,
      createdAt: now
    };

    nextSave = {
      ...nextSave,
      logs: {
        ...nextSave.logs,
        entries: [entry, ...nextSave.logs.entries].slice(0, nextSave.logs.maxEntries)
      }
    };
  }

  return { save: nextSave, learnedNames };
}

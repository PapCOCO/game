import type { GameSaveData } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function validateSaveData(input: unknown): input is GameSaveData {
  if (!isRecord(input)) {
    return false;
  }

  return (
    "version" in input &&
    "player" in input &&
    "inventory" in input &&
    "map" in input &&
    "settings" in input &&
    "runtime" in input
  );
}

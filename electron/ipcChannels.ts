export const IPC_CHANNELS = {
  LOAD_SAVE: "save:load",
  WRITE_SAVE: "save:write"
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

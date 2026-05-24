import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs/promises";
import { IPC_CHANNELS } from "./ipcChannels.js";

const isDev = process.env.NODE_ENV === "development";
const devServerUrl = process.env.VITE_DEV_SERVER_URL;

let mainWindow: BrowserWindow | null = null;

function getSaveFilePath(): string {
  return path.join(app.getPath("userData"), "save.json");
}

async function createMainWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    title: "修仙挂机 MVP Plus",
    backgroundColor: "#101014",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (isDev && devServerUrl) {
    await mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
    return;
  }

  await mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
}

function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.LOAD_SAVE, async () => {
    const savePath = getSaveFilePath();

    try {
      const raw = await fs.readFile(savePath, "utf-8");
      return {
        ok: true,
        data: JSON.parse(raw)
      };
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;

      if (nodeError.code === "ENOENT") {
        return {
          ok: true,
          data: null
        };
      }

      return {
        ok: false,
        error: nodeError.message || "读取存档失败"
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.WRITE_SAVE, async (_event, saveData: unknown) => {
    const savePath = getSaveFilePath();

    try {
      await fs.mkdir(path.dirname(savePath), { recursive: true });
      await fs.writeFile(savePath, JSON.stringify(saveData, null, 2), "utf-8");

      return {
        ok: true
      };
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;

      return {
        ok: false,
        error: nodeError.message || "写入存档失败"
      };
    }
  });

  ipcMain.handle(IPC_CHANNELS.QUIT_GAME, async () => {
    app.quit();
    return { ok: true };
  });
}

app.whenReady().then(async () => {
  registerIpcHandlers();
  await createMainWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

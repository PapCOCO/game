import { useEffect, useState } from "react";

type SaveStatus = "checking" | "no-save" | "loaded" | "error";

function App() {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("checking");
  const [message, setMessage] = useState("正在检查本地存档接口...");

  useEffect(() => {
    let cancelled = false;

    async function checkSaveApi() {
      try {
        const result = await window.gameAPI.loadSave();

        if (cancelled) {
          return;
        }

        if (!result.ok) {
          setSaveStatus("error");
          setMessage(result.error);
          return;
        }

        if (result.data === null) {
          setSaveStatus("no-save");
          setMessage("未发现本地存档。阶段 1 只验证 Electron + React + IPC 骨架。");
          return;
        }

        setSaveStatus("loaded");
        setMessage("已读取到本地存档。阶段 1 暂不解析具体游戏数据。");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setSaveStatus("error");
        setMessage(error instanceof Error ? error.message : "未知错误");
      }
    }

    void checkSaveApi();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleWriteTestSave() {
    const result = await window.gameAPI.writeSave({
      version: 1,
      stage: "skeleton",
      appName: "修仙挂机 MVP Plus",
      savedAt: new Date().toISOString()
    });

    if (result.ok) {
      setSaveStatus("loaded");
      setMessage("测试存档已写入本地 save.json。");
      return;
    }

    setSaveStatus("error");
    setMessage(result.error);
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Electron + Vite + React + TypeScript</p>

        <h1>修仙挂机 MVP Plus</h1>

        <h2>项目骨架验证</h2>

        <p className="description">
          当前阶段只验证窗口创建、React 渲染、preload 暴露接口、基础 IPC
          存档读写。暂不包含修炼、战斗、背包、装备等游戏逻辑。
        </p>

        <div className="status-panel">
          <span className={`status-dot status-${saveStatus}`} />
          <span>{message}</span>
        </div>

        <button className="primary-button" type="button" onClick={handleWriteTestSave}>
          写入测试存档
        </button>
      </section>
    </main>
  );
}

export default App;

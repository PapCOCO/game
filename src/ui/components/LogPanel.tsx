import type { GameLogEntry } from "../../game/types";

interface LogPanelProps {
  logs: GameLogEntry[];
  emptyText?: string;
}

export function LogPanel({ logs, emptyText = "暂无日志。" }: LogPanelProps) {
  const visibleLogs = [...logs]
    .sort((first, second) => second.createdAt - first.createdAt)
    .slice(0, 30);

  if (visibleLogs.length === 0) {
    return <p className="panel-description">{emptyText}</p>;
  }

  return (
    <div className="log-list">
      {visibleLogs.map((log) => (
        <div className="log-item" key={log.id}>
          <span>{log.type}</span>
          <p>{log.message}</p>
        </div>
      ))}
    </div>
  );
}

interface StatBlockProps {
  label: string;
  value: string | number;
}

export function StatBlock({ label, value }: StatBlockProps) {
  return (
    <div className="stat-block">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
    </div>
  );
}

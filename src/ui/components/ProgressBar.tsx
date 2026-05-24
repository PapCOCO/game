interface ProgressBarProps {
  value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(1, value)) * 100;

  return (
    <div className="progress-bar" aria-label="修为进度">
      <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
    </div>
  );
}

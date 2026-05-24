import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface StatBlockProps {
  label: string;
  value: string | number;
  tooltip?: {
    description: string;
    formula?: string;
    howToImprove?: string;
  };
}

export function StatBlock({ label, value, tooltip }: StatBlockProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, placement: 'bottom' as 'bottom' | 'top' });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTooltip && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      let placement: 'bottom' | 'top' = 'bottom';
      let top = rect.bottom + 8;
      let left = rect.left;
      
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        placement = 'top';
        top = rect.top - 8;
      }
      
      setTooltipPosition({ top, left, placement });
    }
  }, [showTooltip]);

  if (!tooltip) {
    return (
      <div className="stat-block">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="stat-block stat-block-with-tooltip"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
      </div>

      {showTooltip && createPortal(
        <div
          className={`floating-stat-detail floating-stat-detail-${tooltipPosition.placement}`}
          style={{
            position: 'fixed',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            zIndex: 99999
          }}
        >
          <div className="stat-detail-header">
            <strong>{label}</strong>
            <span>当前值: {value}</span>
          </div>
          {tooltip.description && (
            <div className="stat-detail-section">
              <span>作用</span>
              <p>{tooltip.description}</p>
            </div>
          )}
          {tooltip.formula && (
            <div className="stat-detail-section">
              <span>计算公式</span>
              <p>{tooltip.formula}</p>
            </div>
          )}
          {tooltip.howToImprove && (
            <div className="stat-detail-section">
              <span>提升方式</span>
              <p>{tooltip.howToImprove}</p>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

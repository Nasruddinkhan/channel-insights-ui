import type { ReactNode } from 'react';
import { comparison } from '../utils/analytics';
export function MetricCard({
  label,
  value,
  previous,
  icon,
  tone,
}: {
  label: string;
  value: number;
  previous: number;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className={`metric-icon ${tone}`}>{icon}</span>
      </div>
      <div className="metric-value">{value.toLocaleString('en-US')}</div>
      <div className="metric-comparison">
        <span className={value >= previous ? 'positive' : 'neutral'}>
          {comparison(value, previous)}
        </span>
      </div>
    </article>
  );
}

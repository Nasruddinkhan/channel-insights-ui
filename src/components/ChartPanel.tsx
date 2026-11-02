import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  TitleComponent,
  CanvasRenderer,
]);
export const WEB = '#3977ed',
  MOBILE = '#13a699';
export function ChartPanel({
  title,
  subtitle,
  option,
  empty = false,
  className = '',
  description,
}: {
  title: string;
  subtitle: string;
  option: EChartsOption;
  empty?: boolean;
  className?: string;
  description: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  useEffect(() => {
    if (!ref.current || empty) return;
    const chart = echarts.init(ref.current);
    chartRef.current = chart;
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [empty]);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option, empty]);
  return (
    <section className={`chart-panel ${className}`}>
      <div className="panel-heading">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {empty ? (
        <div className="chart-empty">
          No requests in this selection.
          <span>Try another date range or department.</span>
        </div>
      ) : (
        <div ref={ref} className="chart" role="img" aria-label={description} />
      )}
    </section>
  );
}

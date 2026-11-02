import type { EChartsOption } from 'echarts';
import type { AnalyticsRow } from '../types';
import type { summarize, dailySeries } from './analytics';
import { WEB, MOBILE } from '../components/ChartPanel';

const legend = {
  bottom: 0,
  icon: 'circle',
  itemWidth: 8,
  itemHeight: 8,
  textStyle: { color: '#697689', fontSize: 12 },
};
const axis = {
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { color: '#8390a2' },
  splitLine: { lineStyle: { color: '#eef1f5', type: 'dashed' as const } },
};

export function requestsByFeature(features: AnalyticsRow[]): EChartsOption {
  return {
    color: [WEB, MOBILE],
    tooltip: { trigger: 'axis' },
    legend,
    grid: { left: 48, right: 24, top: 28, bottom: 60 },
    xAxis: { ...axis, type: 'category', data: features.map((r) => r.name) },
    yAxis: {
      ...axis,
      type: 'value',
      name: 'Requests',
      nameTextStyle: { color: '#8390a2', padding: [0, 0, 10, 0] },
    },
    series: [
      {
        name: 'Web',
        type: 'bar',
        barMaxWidth: 42,
        itemStyle: { borderRadius: [5, 5, 0, 0] },
        data: features.map((r) => r.web),
      },
      {
        name: 'Mobile',
        type: 'bar',
        barMaxWidth: 42,
        itemStyle: { borderRadius: [5, 5, 0, 0] },
        data: features.map((r) => r.mobile),
      },
    ],
  };
}

export function channelDistribution(metrics: ReturnType<typeof summarize>): EChartsOption {
  return {
    color: [WEB, MOBILE],
    tooltip: { trigger: 'item', formatter: '{b}: {c} requests ({d}%)' },
    legend: {
      ...legend,
      formatter: (name) => `${name}   ${name === 'Web' ? metrics.web : metrics.mobile}`,
    },
    title: {
      text: metrics.total.toLocaleString(),
      subtext: 'Total requests',
      left: 'center',
      top: '35%',
      textStyle: { fontSize: 30, fontWeight: 650, color: '#1d2a41' },
      subtextStyle: { color: '#8390a2', fontSize: 12 },
    },
    series: [
      {
        type: 'pie',
        radius: ['62%', '79%'],
        center: ['50%', '45%'],
        label: { show: false },
        itemStyle: { borderColor: '#fff', borderWidth: 5, borderRadius: 5 },
        data: [
          { name: 'Web', value: metrics.web },
          { name: 'Mobile', value: metrics.mobile },
        ],
      },
    ],
  };
}

export function requestTrends(daily: ReturnType<typeof dailySeries>): EChartsOption {
  return {
    color: [WEB, MOBILE],
    tooltip: { trigger: 'axis' },
    legend,
    grid: { left: 48, right: 24, top: 30, bottom: 58 },
    xAxis: {
      ...axis,
      type: 'category',
      boundaryGap: false,
      data: daily.map((d) => d.date),
      axisLabel: {
        color: '#8390a2',
        formatter: (value: string) =>
          new Date(value + 'T12:00:00Z').toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            timeZone: 'Asia/Riyadh',
          }),
        hideOverlap: true,
      },
    },
    yAxis: { ...axis, type: 'value', name: 'Requests', minInterval: 1 },
    series: [
      {
        name: 'Web',
        type: 'line',
        smooth: 0.3,
        showSymbol: false,
        lineStyle: { width: 3 },
        areaStyle: { opacity: 0.04 },
        data: daily.map((d) => d.web),
      },
      {
        name: 'Mobile',
        type: 'line',
        smooth: 0.3,
        showSymbol: false,
        lineStyle: { width: 3 },
        areaStyle: { opacity: 0.06 },
        data: daily.map((d) => d.mobile),
      },
    ],
  };
}

import type { FeatureSummary, Filters, UsageEvent } from '../types';
import { filterEvents, featureDisplayName } from '../utils/analytics';
import { isUsageEvent } from './analyticsService';
import { fetchJson } from './httpClient';

export function summarizeFeatures(events: UsageEvent[], filters: Filters): FeatureSummary[] {
  const groups = new Map<string, FeatureSummary>();
  for (const event of filterEvents(events, filters)) {
    let summary = groups.get(event.feature);
    if (!summary) {
      summary = {
        featureCode: event.feature,
        featureName: event.featureName || featureDisplayName(event.feature),
        webCount: 0,
        mobileCount: 0,
      };
      groups.set(event.feature, summary);
    }
    if (event.featureName) summary.featureName = event.featureName;
    if (event.channel === 'WEB') summary.webCount++;
    else summary.mobileCount++;
  }
  return [...groups.values()].sort((a, b) => a.featureName.localeCompare(b.featureName));
}

export interface FeatureSummaryService {
  getSummaries(filters: Filters, signal?: AbortSignal): Promise<FeatureSummary[]>;
}

interface SummaryResponse extends FeatureSummary {
  events: UsageEvent[];
}

function isSummaryResponse(value: unknown): value is SummaryResponse {
  if (!value || typeof value !== 'object') return false;
  const summary = value as Record<string, unknown>;
  const hasName =
    typeof summary.featureCode === 'string' && typeof summary.featureName === 'string';
  const hasCounts =
    Number.isInteger(summary.webCount) &&
    Number(summary.webCount) >= 0 &&
    Number.isInteger(summary.mobileCount) &&
    Number(summary.mobileCount) >= 0;
  const hasEvents =
    Array.isArray(summary.events) &&
    summary.events.every((event) => isUsageEvent(event) && event.feature === summary.featureCode);
  return hasName && hasCounts && hasEvents;
}

// Replace this implementation with a REST call accepting the same filters.
export const featureSummaryService: FeatureSummaryService = {
  async getSummaries(filters, signal) {
    const query = new URLSearchParams({
      start: filters.start,
      end: filters.end,
      department: filters.department,
      channel: filters.channel,
    });
    const data = await fetchJson(`feature-summary.json?${query}`, signal);
    if (!Array.isArray(data) || !data.every(isSummaryResponse)) {
      throw new Error('The feature summary response is invalid. Please retry.');
    }
    // Static mock assets include underlying events so arbitrary filters remain accurate.
    // A Spring Boot endpoint can return filtered FeatureSummary[] directly instead.
    const events: UsageEvent[] = data.flatMap((item) =>
      item.events.map((event: UsageEvent) => ({ ...event, featureName: item.featureName })),
    );
    return summarizeFeatures(events, filters);
  },
};

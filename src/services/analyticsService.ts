import type { UsageEvent } from '../types';
import { fetchJson } from './httpClient';

export interface AnalyticsService {
  getEvents(signal?: AbortSignal, featureCode?: string): Promise<UsageEvent[]>;
}

export function isUsageEvent(value: unknown): value is UsageEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Record<string, unknown>;
  return (
    ['eventId', 'employeeId', 'departmentId', 'departmentName', 'feature', 'occurredAt'].every(
      (key) => typeof event[key] === 'string' && event[key].length > 0,
    ) &&
    (event.featureName === undefined || typeof event.featureName === 'string') &&
    (event.channel === 'WEB' || event.channel === 'MOBILE') &&
    Number.isFinite(Date.parse(String(event.occurredAt)))
  );
}

export const analyticsService: AnalyticsService = {
  async getEvents(signal, featureCode) {
    const query = featureCode ? `?featureCode=${encodeURIComponent(featureCode)}` : '';
    const data = await fetchJson(`feature-details.json${query}`, signal);
    if (!Array.isArray(data) || !data.every(isUsageEvent)) {
      throw new Error('The request data response is invalid. Please retry.');
    }
    return featureCode ? data.filter((event) => event.feature === featureCode) : data;
  },
};

export type Channel = 'WEB' | 'MOBILE';
export interface UsageEvent {
  eventId: string;
  employeeId: string;
  departmentId: string;
  departmentName: string;
  feature: string;
  featureName?: string;
  channel: Channel;
  occurredAt: string;
}
export interface Filters {
  start: string;
  end: string;
  department: string;
  channel: Channel | 'ALL';
}
export interface AnalyticsRow {
  name: string;
  web: number;
  mobile: number;
  total: number;
  employees: number;
  share: number;
}
export interface FeatureSummary {
  featureCode: string;
  featureName: string;
  webCount: number;
  mobileCount: number;
}

export interface AnalyticsNavigationState {
  filters?: Filters;
  featureName?: string;
}

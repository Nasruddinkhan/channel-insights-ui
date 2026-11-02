import type { AnalyticsRow, Filters, UsageEvent } from '../types';

const DAY_IN_MS = 86_400_000;
const riyadhDate = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Riyadh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function dateKey(timestamp: string) {
  return riyadhDate.format(new Date(timestamp));
}

export function shiftDate(date: string, days: number) {
  const timestamp = Date.parse(`${date}T00:00:00Z`) + days * DAY_IN_MS;
  return new Date(timestamp).toISOString().slice(0, 10);
}

function distinctEvents(events: UsageEvent[]) {
  const byId = new Map<string, UsageEvent>();
  for (const event of events) byId.set(event.eventId, event);
  return [...byId.values()];
}

export function filterEvents(events: UsageEvent[], filters: Filters) {
  const matchingEvents = events.filter((event) => {
    const date = dateKey(event.occurredAt);
    const matchesDate = date >= filters.start && date <= filters.end;
    const matchesDepartment =
      filters.department === 'ALL' || event.departmentId === filters.department;
    const matchesChannel = filters.channel === 'ALL' || event.channel === filters.channel;
    return matchesDate && matchesDepartment && matchesChannel;
  });
  return distinctEvents(matchingEvents);
}

export function percentage(part: number, total: number) {
  return total === 0 ? 0 : (part / total) * 100;
}

export function summarize(events: UsageEvent[]) {
  const requests = distinctEvents(events);
  const web = requests.filter((event) => event.channel === 'WEB').length;
  const employees = new Set(requests.map((event) => event.employeeId)).size;
  return { total: requests.length, web, mobile: requests.length - web, employees };
}

export function row(name: string, events: UsageEvent[]): AnalyticsRow {
  const metrics = summarize(events);
  return { name, ...metrics, share: percentage(metrics.mobile, metrics.total) };
}

export function previousFilters(filters: Filters): Filters {
  const days = Math.round((Date.parse(filters.end) - Date.parse(filters.start)) / DAY_IN_MS) + 1;
  return {
    ...filters,
    start: shiftDate(filters.start, -days),
    end: shiftDate(filters.start, -1),
  };
}

export function comparison(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 'No change' : 'No prior activity';
  const change = percentage(current - previous, previous);
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}% vs previous period`;
}

export function dailySeries(events: UsageEvent[], filters: Filters) {
  const counts = new Map<string, { web: number; mobile: number }>();
  for (const event of events) {
    const date = dateKey(event.occurredAt);
    const day = counts.get(date) ?? { web: 0, mobile: 0 };
    if (event.channel === 'WEB') day.web++;
    else day.mobile++;
    counts.set(date, day);
  }

  const days = [];
  for (let date = filters.start; date <= filters.end; date = shiftDate(date, 1)) {
    const day = counts.get(date) ?? { web: 0, mobile: 0 };
    days.push({ date, web: day.web, mobile: day.mobile });
  }
  return days;
}

export function featureDisplayName(code: string) {
  return code
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export function featureRows(events: UsageEvent[]) {
  const codes = [...new Set(events.map((event) => event.feature))];
  return codes.map((code) => {
    const requests = events.filter((event) => event.feature === code);
    const name =
      requests.find((event) => event.featureName)?.featureName || featureDisplayName(code);
    return row(name, requests);
  });
}

export function departmentRows(events: UsageEvent[]) {
  const ids = [...new Set(events.map((event) => event.departmentId))];
  return ids.map((id) => {
    const requests = events.filter((event) => event.departmentId === id);
    return row(requests[0].departmentName, requests);
  });
}

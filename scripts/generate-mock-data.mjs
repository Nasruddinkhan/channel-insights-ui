import { writeFileSync } from 'node:fs';

const DEMO_END = '2026-11-02';
const departments = ['Finance Department', 'Sales', 'HR', 'ERP'];
let seed = 731;
const random = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};
const events = [];
for (let day = 0; day < 150; day++) {
  const date = new Date(`${DEMO_END}T12:00:00+03:00`);
  date.setUTCDate(date.getUTCDate() - day);
  const count = 12 + Math.floor(random() * 26) + (day < 30 ? 10 : 0);
  for (let i = 0; i < count; i++) {
    const employee = Math.floor(random() * 420);
    const department = employee % departments.length;
    const at = new Date(date);
    at.setUTCHours(Math.floor(random() * 24), Math.floor(random() * 60));
    events.push({
      eventId: `EV-${day}-${i}`,
      employeeId: `EMP-${employee}`,
      departmentId: String(department),
      departmentName: departments[department],
      feature: random() < 0.61 ? 'LEAVE' : 'REMOTE_WORK',
      channel: random() < 0.58 ? 'MOBILE' : 'WEB',
      occurredAt: at.toISOString(),
    });
  }
}

writeFileSync(
  new URL('../public/assets/feature-details.json', import.meta.url),
  JSON.stringify(events, null, 2) + '\n',
);
console.log(`Generated ${events.length} demo events.`);

const groups = new Map();
for (const event of events) {
  let summary = groups.get(event.feature);
  if (!summary) {
    summary = {
      featureCode: event.feature,
      featureName: event.feature
        .toLowerCase()
        .split('_')
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(' '),
      webCount: 0,
      mobileCount: 0,
      events: [],
    };
    groups.set(event.feature, summary);
  }
  summary[event.channel === 'WEB' ? 'webCount' : 'mobileCount']++;
  summary.events.push(event);
}
writeFileSync(
  new URL('../public/assets/feature-summary.json', import.meta.url),
  JSON.stringify([...groups.values()], null, 2) + '\n',
);

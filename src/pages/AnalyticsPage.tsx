import { useCallback, useMemo, useState } from 'react';
import { useHttp } from '../hooks/useHttp';
import { Link } from 'react-router-dom';
import { Alert, Button, CircularProgress } from '@mui/material';
import PeopleOutline from '@mui/icons-material/PeopleOutline';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import Language from '@mui/icons-material/Language';
import Smartphone from '@mui/icons-material/Smartphone';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import type { Filters, UsageEvent } from '../types';
import { analyticsService } from '../services/analyticsService';
import { DEMO_END } from '../data/events';
import {
  filterEvents,
  previousFilters,
  summarize,
  dailySeries,
  featureRows,
  departmentRows,
  featureDisplayName,
} from '../utils/analytics';
import { FilterBar, defaultFilters } from '../components/FilterBar';
import { MetricCard } from '../components/MetricCard';
import { ChartPanel } from '../components/ChartPanel';
import { AnalyticsTable } from '../components/AnalyticsTable';
import { requestsByFeature, channelDistribution, requestTrends } from '../utils/chartOptions';
const EMPTY_EVENTS: UsageEvent[] = [];
export function AnalyticsPage({
  feature,
  featureTitle,
  initialFilters = defaultFilters,
}: {
  feature?: string;
  featureTitle?: string;
  initialFilters?: Filters;
}) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const request = useCallback(
    (signal: AbortSignal) => analyticsService.getEvents(signal, feature),
    [feature],
  );
  const { data, loading, error, retry } = useHttp(request);
  const events = data ?? EMPTY_EVENTS;
  const source = useMemo(
    () => (feature ? events.filter((e) => e.feature === feature) : events),
    [events, feature],
  );
  const selected = useMemo(() => filterEvents(source, filters), [source, filters]);
  const previous = useMemo(() => filterEvents(source, previousFilters(filters)), [source, filters]);
  const metrics = summarize(selected);
  const prior = summarize(previous);
  const features = featureRows(selected);
  const rows = feature ? departmentRows(selected) : features;
  const daily = dailySeries(selected, filters);
  const grouped = requestsByFeature(features);
  const donut = channelDistribution(metrics);
  const line = requestTrends(daily);
  const featureName =
    featureTitle ||
    events.find((event) => event.feature === feature)?.featureName ||
    (feature && featureDisplayName(feature));
  const title = feature ? `${featureName} analytics` : 'Channel overview';
  return (
    <>
      {feature && (
        <Link className="back-to-summary" to="/feature-summary" state={{ filters }}>
          ← Feature Summary
        </Link>
      )}
      <div className="page-heading">
        <div>
          <div className="eyebrow">WORKFORCE INTELLIGENCE</div>
          <h1>{title}</h1>
          <p>
            {feature
              ? 'Understand request activity and adoption across your departments.'
              : 'A clearer view of how your people connect, across every channel.'}
          </p>
        </div>
        <div className="snapshot">
          <CalendarTodayOutlined fontSize="small" />
          <span>
            Demo snapshot<strong>02 November 2026</strong>
          </span>
        </div>
      </div>
      <FilterBar onApply={setFilters} initialFilters={initialFilters} />
      <div className="section-caption">
        <span>
          <span className="live-dot" /> {feature ? 'Feature performance' : 'Performance overview'}
        </span>
        <span>
          {filters.start} — {filters.end} <span className="period-label">Asia/Riyadh</span>
        </span>
      </div>
      {loading ? (
        <div className="loading" role="status">
          <CircularProgress size={28} />
          <p>Loading workforce insights…</p>
        </div>
      ) : error ? (
        <Alert
          severity="error"
          action={
            <Button
              onClick={() => {
                sessionStorage.setItem('retried', '1');
                retry();
              }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      ) : (
        <>
          <div className="metrics">
            <MetricCard
              label="Unique active employees"
              value={metrics.employees}
              previous={prior.employees}
              icon={<PeopleOutline />}
              tone="purple"
            />
            <MetricCard
              label="Total submitted requests"
              value={metrics.total}
              previous={prior.total}
              icon={<DescriptionOutlined />}
              tone="blue"
            />
            <MetricCard
              label="Web requests"
              value={metrics.web}
              previous={prior.web}
              icon={<Language />}
              tone="blue"
            />
            <MetricCard
              label="Mobile requests"
              value={metrics.mobile}
              previous={prior.mobile}
              icon={<Smartphone />}
              tone="teal"
            />
          </div>
          <div className="charts-grid">
            {!feature && (
              <ChartPanel
                title="Requests by feature"
                subtitle="Compare channel activity across services"
                option={grouped}
                empty={!metrics.total}
                description={features
                  .map((r) => `${r.name}: ${r.web} Web and ${r.mobile} Mobile requests`)
                  .join('. ')}
              />
            )}
            <ChartPanel
              title="Channel distribution"
              subtitle="Where your requests come from"
              option={donut}
              empty={!metrics.total}
              description={`${metrics.web} Web requests; ${metrics.mobile} Mobile requests`}
              className={feature ? 'feature-donut' : ''}
            />
            <ChartPanel
              title="Request trends"
              subtitle="Daily submitted requests across channels"
              option={line}
              empty={!metrics.total}
              className={feature ? 'feature-trend' : 'full-width'}
              description={`Daily Web and Mobile request counts from ${filters.start} to ${filters.end}. Total ${metrics.total} requests.`}
            />
          </div>
          <AnalyticsTable
            key={feature || 'overview'}
            rows={rows}
            department={!!feature}
            filterKey={`${filters.start}_${filters.end}`}
          />
          <div className="data-note">
            <span className="info-symbol">i</span>
            <span>
              <strong>About this data</strong> This dashboard uses deterministic demo data through{' '}
              {DEMO_END}. Requests are distinct events; employees are deduplicated across channels.
              Comparisons use the previous equivalent period.
            </span>
          </div>
        </>
      )}
    </>
  );
}

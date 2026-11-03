import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useHttp } from '../hooks/useHttp';
import { Alert, Button, CircularProgress } from '@mui/material';
import WidgetsOutlined from '@mui/icons-material/WidgetsOutlined';
import type { Filters, AnalyticsNavigationState } from '../types';
import { featureSummaryService } from '../services/featureSummaryService';
import { FilterBar, defaultFilters } from '../components/FilterBar';
import { FeatureSummaryCard } from '../components/FeatureSummaryCard';

export function FeatureSummaryPage() {
  const location = useLocation();
  const state = location.state as AnalyticsNavigationState | null;
  const [filters, setFilters] = useState<Filters>(state?.filters ?? defaultFilters);
  const request = useCallback(
    (signal: AbortSignal) => featureSummaryService.getSummaries(filters, signal),
    [filters],
  );
  const { data, loading, error, retry } = useHttp(request);
  const summaries = data ?? [];
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">WORKFORCE INTELLIGENCE</div>
          <h1>Feature Summary</h1>
          <p>Compare request activity across every feature in your workspace.</p>
        </div>
        <span className="demo-pill">DEMO DATA</span>
      </div>
      <FilterBar onApply={setFilters} initialFilters={filters} />
      <div className="section-caption">
        <span>
          <span className="live-dot" />
          Feature activity
        </span>
        <span>
          {filters.start} — {filters.end} <span className="period-label">Asia/Riyadh</span>
        </span>
      </div>
      {loading ? (
        <div className="loading" role="status">
          <CircularProgress size={28} />
          <p>Loading feature summaries…</p>
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
      ) : summaries.length ? (
        <div className="feature-summary-grid">
          {summaries.map((summary) => (
            <FeatureSummaryCard key={summary.featureCode} summary={summary} filters={filters} />
          ))}
        </div>
      ) : (
        <section className="feature-summary-empty" role="status">
          <WidgetsOutlined />
          <h2>No feature activity</h2>
          <p>No requests match these filters. Try another date range or department.</p>
        </section>
      )}
      <div className="data-note">
        <span className="info-symbol">i</span>
        <span>
          <strong>Demo feature summaries.</strong> Counts represent distinct request events from the
          same demo dataset. Total requests = Web requests + Mobile requests.
        </span>
      </div>
    </>
  );
}

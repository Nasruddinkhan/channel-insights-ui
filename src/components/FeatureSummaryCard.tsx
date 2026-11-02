import { BeachAccessOutlined, LaptopMacOutlined, WidgetsOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import type { FeatureSummary, Filters } from '../types';
const icons: Record<string, typeof WidgetsOutlined> = {
  LEAVE: BeachAccessOutlined,
  REMOTE_WORK: LaptopMacOutlined,
};
export function FeatureSummaryCard({
  summary,
  filters,
}: {
  summary: FeatureSummary;
  filters: Filters;
}) {
  const Icon = icons[summary.featureCode] ?? WidgetsOutlined;
  const total = summary.webCount + summary.mobileCount;
  return (
    <Link
      to={`/feature-summary/${encodeURIComponent(summary.featureCode)}`}
      state={{ filters, featureName: summary.featureName }}
      className="feature-summary-card feature-summary-link"
      aria-label={`View ${summary.featureName} analytics`}
    >
      <div className="feature-summary-heading">
        <span className="metric-icon blue">
          <Icon />
        </span>
        <h2>{summary.featureName}</h2>
      </div>
      <div className="metric-value">{total.toLocaleString('en-US')}</div>
      <p className="feature-total-label">Total requests</p>
      <dl className="feature-channel-counts">
        <div>
          <dt>
            <span className="channel-dot web-dot" />
            Web requests
          </dt>
          <dd className="web-number">{summary.webCount.toLocaleString('en-US')}</dd>
        </div>
        <div>
          <dt>
            <span className="channel-dot mobile-dot" />
            Mobile requests
          </dt>
          <dd className="mobile-number">{summary.mobileCount.toLocaleString('en-US')}</dd>
        </div>
      </dl>
    </Link>
  );
}

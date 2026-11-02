import { useLocation, useParams } from 'react-router-dom';
import type { AnalyticsNavigationState } from '../types';
import { AnalyticsPage } from './AnalyticsPage';

export function FeatureAnalyticsPage() {
  const { featureCode } = useParams<{ featureCode: string }>();
  const location = useLocation();
  const state = location.state as AnalyticsNavigationState | null;
  return (
    <AnalyticsPage
      key={location.key}
      feature={featureCode}
      featureTitle={state?.featureName}
      initialFilters={state?.filters}
    />
  );
}

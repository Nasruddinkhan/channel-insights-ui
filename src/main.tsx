import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { DashboardLayout } from './components/DashboardLayout';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { FeatureSummaryPage } from './pages/FeatureSummaryPage';
import { FeatureAnalyticsPage } from './pages/FeatureAnalyticsPage';
import './styles.css';
const theme = createTheme({
  palette: {
    primary: { main: '#3977ed' },
    background: { default: '#f6f8fb' },
    text: { primary: '#202e44', secondary: '#7b8799' },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { textTransform: 'none', fontWeight: 600, fontSize: 12 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: '#eef1f5', fontSize: 12, padding: '19px 24px' },
        head: {
          background: '#fafbfd',
          color: '#7b8799',
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: 'nowrap',
        },
      },
    },
  },
});
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<AnalyticsPage />} />
            <Route path="/feature-summary" element={<FeatureSummaryPage />} />
            <Route path="/feature-summary/:featureCode" element={<FeatureAnalyticsPage />} />
            <Route path="/leave" element={<Navigate to="/feature-summary/LEAVE" replace />} />
            <Route
              path="/remote-work"
              element={<Navigate to="/feature-summary/REMOTE_WORK" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);

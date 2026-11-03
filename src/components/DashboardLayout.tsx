import { useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import Menu from '@mui/icons-material/Menu';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import InsightsOutlined from '@mui/icons-material/InsightsOutlined';
import ViewModuleOutlined from '@mui/icons-material/ViewModuleOutlined';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import HelpOutline from '@mui/icons-material/HelpOutline';
const navigation = [
  { path: '/feature-summary', label: 'Feature Summary', icon: ViewModuleOutlined },
  { path: '/', label: 'Overview', icon: DashboardOutlined },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={collapsed ? 'app collapsed' : 'app'}>
      <aside>
        <Link className="brand" to="/" aria-label="Channel Insights home">
          <span className="brand-mark">
            <InsightsOutlined />
          </span>
          <span className="sidebar-label">
            channel<span className="brand-light">insights</span>
          </span>
        </Link>
        <div className="workspace sidebar-label">WORKSPACE</div>
        <nav>
          {navigation.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} end={path === '/'} title={label}>
              <Icon />
              <span className="sidebar-label">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-box sidebar-label">
            <span className="live-dot" /> Demo workspace
            <p>
              Explore your workforce data.
              <br />
              All data is simulated.
            </p>
          </div>
          <button
            className="collapse-button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft />
            <span className="sidebar-label">Collapse sidebar</span>
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header>
          <div className="header-left">
            <IconButton aria-label="Toggle navigation" onClick={() => setCollapsed(!collapsed)}>
              <Menu />
            </IconButton>
            <span>
              Workspace <span className="breadcrumb-slash">/</span>{' '}
              <strong>Workforce analytics</strong>
            </span>
          </div>
          <div className="header-right">
            <span className="demo-pill">DEMO DATA</span>
            <Tooltip title="Metrics use simulated request events. Dates are shown in Asia/Riyadh.">
              <IconButton aria-label="About this dashboard">
                <HelpOutline fontSize="small" />
              </IconButton>
            </Tooltip>
            <span className="avatar">NA</span>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <span>
            Channel Insights <span className="footer-dot">·</span> Internal management dashboard
          </span>
          <span>Timezone: Asia/Riyadh (UTC+03:00)</span>
        </footer>
      </div>
    </div>
  );
}

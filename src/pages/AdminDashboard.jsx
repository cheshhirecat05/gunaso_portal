import { useState } from 'react';
import { useApp } from '../context/AppContext';

import ADHome from '../panels/admin/ADHome';
import ADGrievances from '../panels/admin/ADGrievances';
import ADCitizens from '../panels/admin/ADCitizens';
import ADGrievanceGallery from '../panels/admin/ADGrievanceGallery';
import ADReports from '../panels/admin/ADReports';
import ADSettings from '../panels/admin/ADSettings';

const panels = [
  { id: 'home', label: 'Dashboard', icon: '🏠', section: 'Main' },
  { id: 'grievances', label: 'All Grievances', icon: '📋' },
  { id: 'citizens', label: 'Citizens', icon: '👥', section: 'Management' },
  { id: 'grievancegallery', label: 'Grievance Gallery', icon: '🖼️'},
  { id: 'reports', label: 'Reports', icon: '📈' },
  { id: 'settings', label: 'Settings', icon: '⚙️', section: 'Settings' }
];

export default function AdminDashboard() {
  const { logout } = useApp();
  const [activePanel, setActivePanel] = useState('home');

  const titles = {
    home: 'Admin Dashboard',
    grievances: 'All Grievances',
    citizens: 'Citizens',
    grievancegallery: 'Grievance Gallery',
    reports: 'Reports & Analytics',
    settings: 'Settings'
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'home':
        return <ADHome />;

      case 'grievances':
        return <ADGrievances />;

      case 'citizens':
        return <ADCitizens />;

      case 'grievancegallery':
        return <ADGrievanceGallery />;

      case 'reports':
        return <ADReports />;

      case 'settings':
        return <ADSettings />;

      default:
        return null;
    }
  };

  return (
    <div className="dashboard">

      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="nav-logo">G</div>

          <div>
            <div className="sidebar-brand-name">Gunaso</div>
            <div className="sidebar-brand-role">Admin Panel</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {panels.map(p => (
            <div key={p.id}>
              {p.section && (
                <div className="sidebar-section">
                  {p.section}
                </div>
              )}

              <button
                className={`sidebar-item ${activePanel === p.id ? 'active' : ''}`}
                onClick={() => setActivePanel(p.id)}
              >
                <span className="sidebar-item-icon">{p.icon}</span>
                {p.label}
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">

          <div className="user-info">
            <div
              className="user-avatar"
              style={{
                background:
                  'linear-gradient(135deg,var(--gold),var(--crimson))'
              }}
            >
              A
            </div>

            <div>
              <div className="user-name">Administrator</div>
              <div className="user-email">admin@gunaso.gov.np</div>
            </div>
          </div>

          <button
            className="btn-outline-red"
            style={{ width: '100%', marginTop: 14 }}
            onClick={logout}
          >
            Sign Out
          </button>

        </div>

      </aside>

      <main className="dash-main">

        <div className="dash-topbar">

          <div>
            <div className="dash-page-title">
              {titles[activePanel]}
            </div>

            <div className="dash-page-sub">
              System overview and key metrics
            </div>
          </div>

          <div className="dash-topbar-actions">
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: 'var(--text-mid)'
              }}
            >
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

        </div>

        <div className="dash-content">
          {renderPanel()}
        </div>

      </main>

    </div>
  );
}

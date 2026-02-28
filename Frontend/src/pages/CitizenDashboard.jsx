import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../utils/api';

import CDHome from '../panels/citizen/CDHome';
import CDSubmit from '../panels/citizen/CDSubmit';
import CDTickets from '../panels/citizen/CDTickets';
import CDProfile from '../panels/citizen/CDProfile';
import CDNotifications from '../panels/citizen/CDNotifications';
import CDGallery from '../panels/citizen/CDGallery';

const panels = [
  { id: 'home', label: 'Dashboard', icon: '🏠' },
  { id: 'submit', label: 'Submit Grievance', icon: '📝' },
  { id: 'tickets', label: 'My Tickets', icon: '🎫' },
  { id: 'gallery', label: 'My Gallery', icon: '🖼️' },
  { id: 'profile', label: 'My Profile', icon: '👤' },
  { id: 'notif', label: 'Notifications', icon: '🔔' },
];

export default function CitizenDashboard() {
  const { session, logout } = useApp();
  const user = session?.user;
  const [activePanel, setActivePanel] = useState('home');
  const [grievances, setGrievances] = useState([]);

  const fetchGrievances = useCallback(async () => {
    try {
      const data = await api.getMyGrievances({ limit: 1000 });
      setGrievances(data.grievances || []);
    } catch (err) {
      console.error('Failed to fetch grievances:', err);
    }
  }, []);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  // ✅ Added gallery title
  const titles = {
    home: 'Dashboard Overview',
    submit: 'Submit Grievance',
    tickets: 'My Tickets',
    gallery: 'My Complain Gallery',
    profile: 'My Profile',
    notif: 'Notifications'
  };

  // ✅ Added gallery case
  const renderPanel = () => {
    switch (activePanel) {
      case 'home':
        return (
          <CDHome
            user={user}
            grievances={grievances}
            onNewGrievance={() => setActivePanel('submit')}
          />
        );

      case 'submit':
        return <CDSubmit user={user} onSubmitted={fetchGrievances} />;

      case 'tickets':
        return <CDTickets user={user} grievances={grievances} onRefresh={fetchGrievances} />;

      case 'gallery':
        return <CDGallery user={user} grievances={grievances} />;

      case 'profile':
        return <CDProfile user={user} />;

      case 'notif':
        return <CDNotifications user={user} grievances={grievances} />;

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
            <div className="sidebar-brand-role">Citizen Portal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Main</div>
          {panels.map(p => (
            <button
              key={p.id}
              className={`sidebar-item ${activePanel === p.id ? 'active' : ''}`}
              onClick={() => setActivePanel(p.id)}
            >
              <span className="sidebar-item-icon">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
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
              Welcome back. Here's what's happening.
            </div>
          </div>

          <div className="dash-topbar-actions">
            <button
              className="btn-primary btn-sm"
              onClick={() => setActivePanel('submit')}
            >
              + New Grievance
            </button>
          </div>
        </div>

        <div className="dash-content">
          {renderPanel()}
        </div>
      </main>
    </div>
  );
}

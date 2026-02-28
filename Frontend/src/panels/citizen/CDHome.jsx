import Badge from '../../components/Badge';

export default function CDHome({ user, grievances, onNewGrievance }) {
  // grievances already filtered for this user from the API
  const myGrievances = grievances;
  const pending = myGrievances.filter(g => g.status === 'Pending').length;
  const resolved = myGrievances.filter(g => g.status === 'Resolved').length;
  const recent = myGrievances.slice(0, 3);

  return (
    <div>
      <div className="welcome-banner">
        <div className="welcome-greeting">Good day,</div>
        <div className="welcome-name">{user.name}</div>
        <div className="welcome-info">Citizen ID: <strong style={{ color: 'var(--gold)', fontFamily: "'JetBrains Mono',monospace" }}>{user.id}</strong> &nbsp;|&nbsp; Registered Member</div>
      </div>
      <div className="stats-cards" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card"><div className="stat-card-accent accent-red"></div><div className="stat-card-icon">📋</div><div className="stat-card-num">{myGrievances.length}</div><div className="stat-card-label">Total Submitted</div></div>
        <div className="stat-card"><div className="stat-card-accent accent-gold"></div><div className="stat-card-icon">⏳</div><div className="stat-card-num">{pending}</div><div className="stat-card-label">Pending Review</div></div>
        <div className="stat-card"><div className="stat-card-accent accent-green"></div><div className="stat-card-icon">✅</div><div className="stat-card-num">{resolved}</div><div className="stat-card-label">Resolved</div></div>
      </div>
      <div className="table-card">
        <div className="table-header"><div className="table-title">Recent Tickets</div><button className="btn-primary btn-sm" onClick={onNewGrievance}>+ New</button></div>
        <table>
          <thead><tr><th>Ticket</th><th>Subject</th><th>Category</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {recent.length === 0
              ? <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 30 }}>No grievances submitted yet.</td></tr>
              : recent.map(g => (
                <tr key={g.ticketNo}>
                  <td><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{g.ticketNo}</span></td>
                  <td>{g.subject}</td>
                  <td>{g.category}</td>
                  <td>{new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td><Badge status={g.status} /></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
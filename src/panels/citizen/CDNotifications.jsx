export default function CDNotifications({ grievances, user }) {
  const myGrievances = grievances.filter(g => g.userId === user.id);
  return (
    <div>
      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, color: 'var(--navy)', marginBottom: 20 }}>Notifications</h2>
      {myGrievances.length === 0
        ? <div className="alert alert-info">No notifications yet. Submit a grievance to get started.</div>
        : myGrievances.map(g => (
          <div key={g.ticketNo} style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>{g.ticketNo}</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{g.subject}</div>
            <div style={{ fontSize: 13, color: 'var(--text-mid)' }}>Status: <strong>{g.status}</strong> · {new Date(g.date).toLocaleDateString()}</div>
          </div>
        ))
      }
    </div>
  );
}
import Badge from '../../components/Badge';

export default function CDTickets({ user, grievances }) {
  const myGrievances = grievances.filter(g => g.userId === user.id).reverse();
  return (
    <div className="table-card">
      <div className="table-header"><div className="table-title">My Tickets</div><div style={{ fontSize: 13, color: 'var(--text-mid)' }}>{myGrievances.length} total</div></div>
      <table>
        <thead><tr><th>Ticket</th><th>Subject</th><th>Category</th><th>Priority</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          {myGrievances.length === 0
            ? <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 30 }}>No tickets found.</td></tr>
            : myGrievances.map(g => (
              <tr key={g.ticketNo}>
                <td><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{g.ticketNo}</span></td>
                <td>{g.subject}</td>
                <td>{g.category}</td>
                <td><Badge status={g.priority} /></td>
                <td>{new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td><Badge status={g.status} /></td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
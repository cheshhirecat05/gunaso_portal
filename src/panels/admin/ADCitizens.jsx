import { getUsers, getGrievances } from '../../utils/storage';
import Badge from '../../components/Badge';

export default function ADCitizens() {
  const users = getUsers();
  const grievances = getGrievances();
  return (
    <div className="table-card">
      <div className="table-header"><div className="table-title">Registered Citizens</div><div style={{ fontSize: 13, color: 'var(--text-mid)' }}>{users.length} total</div></div>
      <table>
        <thead><tr><th>Citizen ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th><th>Grievances</th><th>Status</th></tr></thead>
        <tbody>
          {users.length === 0
            ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 30 }}>No registered citizens yet.</td></tr>
            : users.map(u => (
              <tr key={u.id}>
                <td><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{u.id}</span></td>
                <td>{u.name}</td><td>{u.email}</td><td>{u.phone || '-'}</td>
                <td>{u.registeredAt}</td>
                <td>{grievances.filter(g => g.userId === u.id).length}</td>
                <td><Badge status="Active" /></td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
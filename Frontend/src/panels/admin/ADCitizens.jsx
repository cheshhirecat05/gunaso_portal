import { useState, useEffect } from 'react';
import * as api from '../../utils/api';
import Badge from '../../components/Badge';
import Pagination from '../../components/Pagination';

export default function ADCitizens() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.getAllCitizens({ page, limit: 10 })
      .then(data => {
        setUsers(data.citizens || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      })
      .catch(err => console.error('Failed to load citizens:', err));
  }, [page]);

  return (
    <div className="table-card">
      <div className="table-header"><div className="table-title">Registered Citizens</div><div style={{ fontSize: 13, color: 'var(--text-mid)' }}>{total} total</div></div>
      <table>
        <thead><tr><th>Citizen ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Registered</th><th>Grievances</th><th>Status</th></tr></thead>
        <tbody>
          {users.length === 0
            ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 30 }}>No registered citizens yet.</td></tr>
            : users.map(u => (
              <tr key={u.citizenId}>
                <td><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{u.citizenId}</span></td>
                <td>{u.name}</td><td>{u.email}</td><td>{u.phone || '-'}</td>
                <td>{new Date(u.registeredAt).toLocaleDateString()}</td>
                <td>{u.grievanceCount || 0}</td>
                <td><Badge status={u.status || "Active"} /></td>
              </tr>
            ))}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
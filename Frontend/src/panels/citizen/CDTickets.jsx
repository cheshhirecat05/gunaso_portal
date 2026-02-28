import { useState } from 'react';
import Badge from '../../components/Badge';
import Alert from '../../components/Alert';
import Pagination from '../../components/Pagination';
import * as api from '../../utils/api';

const PER_PAGE = 8;

export default function CDTickets({ user, grievances, onRefresh }) {
  const myGrievances = grievances;
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [alert, setAlert] = useState({ type: '', msg: '' });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(myGrievances.length / PER_PAGE);
  const paged = myGrievances.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openEdit = (g) => {
    setEditing(g.ticketNo);
    setEditForm({
      subject: g.subject,
      category: g.category,
      priority: g.priority || 'Normal',
      location: g.location,
      desc: g.desc,
      attachment: g.attachment || null,
    });
    setAlert({ type: '', msg: '' });
  };

  const handleEditFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setAlert({ type: 'error', msg: 'Only image files (JPG, PNG, WEBP) are allowed' });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm(prev => ({
        ...prev,
        attachment: { name: file.name, type: file.type, data: reader.result }
      }));
    };
    reader.readAsDataURL(file);
  };

  const saveEdit = async () => {
    if (!editForm.subject || !editForm.category || !editForm.location || !editForm.desc) {
      return setAlert({ type: 'error', msg: 'Please fill all required fields.' });
    }
    setSaving(true);
    try {
      const data = await api.updateGrievance(editing, editForm);
      setAlert({ type: 'success', msg: data.message });
      setEditing(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="table-card">
      <div className="table-header"><div className="table-title">My Tickets</div><div style={{ fontSize: 13, color: 'var(--text-mid)' }}>{myGrievances.length} total</div></div>
      <table>
        <thead><tr><th>Ticket</th><th>Subject</th><th>Category</th><th>Priority</th><th>Date</th><th>Status</th><th>Image</th><th>Action</th></tr></thead>
        <tbody>
          {paged.length === 0
            ? <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 30 }}>No tickets found.</td></tr>
            : paged.map(g => (
              <tr key={g.ticketNo}>
                <td><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{g.ticketNo}</span></td>
                <td>{g.subject}</td>
                <td>{g.category}</td>
                <td><Badge status={g.priority} /></td>
                <td>{new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td><Badge status={g.status} /></td>
                <td>
                  {g.attachment ? (
                    <img
                      src={g.attachment.data}
                      alt=""
                      width={40}
                      style={{ borderRadius: 6, cursor: 'pointer' }}
                      onClick={() => setPreview(g.attachment.data)}
                    />
                  ) : '-'}
                </td>
                <td>
                  {g.status === 'Pending' ? (
                    <button className="btn-outline" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => openEdit(g)}>Edit</button>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-light)' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 999, cursor: 'pointer'
          }}
        >
          <img src={preview} style={{ maxWidth: '80%', maxHeight: '80%', borderRadius: 8 }} alt="" />
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}
        >
          <div style={{
            background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)'
          }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", marginBottom: 16 }}>
              Edit Grievance — {editing}
            </h3>

            <Alert type={alert.type} message={alert.msg} />

            <div className="form-group">
              <label>Subject *</label>
              <input className="form-input" value={editForm.subject} onChange={e => setEditForm({ ...editForm, subject: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select className="form-input" value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                <option value="">Select category</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>Infrastructure</option>
                <option>Environment</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select className="form-input" value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })}>
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label>Address, Ward no, Tole *</label>
              <input className="form-input" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea className="form-input" value={editForm.desc} onChange={e => setEditForm({ ...editForm, desc: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Attach Image</label>
              {editForm.attachment && (
                <div style={{ marginBottom: 8 }}>
                  <img src={editForm.attachment.data} width={60} style={{ borderRadius: 6 }} alt="" />
                  <button style={{ marginLeft: 8, fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setEditForm({ ...editForm, attachment: null })}>Remove</button>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleEditFile} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn-primary" onClick={saveEdit} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
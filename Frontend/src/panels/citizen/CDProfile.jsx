import { useState } from 'react';
import * as api from '../../utils/api';
import Alert from '../../components/Alert';

export default function CDProfile({ user }) {
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', address: user.address || '' });
  const [alert, setAlert] = useState({ type: '', msg: '' });

  const save = async () => {
    try {
      await api.updateProfile(form);
      setAlert({ type: 'success', msg: '✅ Profile updated successfully.' });
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    }
  };

  return (
    <div className="grievance-form-card">
      <h2 className="grievance-form-title">My Profile</h2>
      <p className="grievance-form-sub">Update your personal information</p>
      <Alert type={alert.type} message={alert.msg} />
      <div className="form-row">
        <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
      </div>
      <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={user.email} disabled style={{ opacity: 0.6 }} /></div>
      <div className="form-group"><label className="form-label">Citizen ID</label><input className="form-input" value={user.id} disabled style={{ fontFamily: "'JetBrains Mono',monospace", opacity: 0.6 }} /></div>
      <div className="form-group"><label className="form-label">Address / Ward</label><input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
      <button className="btn-primary" onClick={save}>Save Changes</button>
    </div>
  );
}
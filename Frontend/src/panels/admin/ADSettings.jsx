import { useState } from 'react';
import * as api from '../../utils/api';
import Alert from '../../components/Alert';

export default function ADSettings() {
  const [form, setForm] = useState({
    name: 'System Administrator',
    email: 'admin@gunaso.gov.np',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [alert, setAlert] = useState({ type: '', msg: '' });

  const save = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return setAlert({ type: 'error', msg: 'New passwords do not match.' });
    }
    try {
      await api.updateSettings({
        name: form.name,
        email: form.email,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined
      });
      setAlert({ type: 'success', msg: '✅ Settings updated successfully.' });
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    }
  };

  return (
    <div className="grievance-form-card">
      <h2 className="grievance-form-title">System Settings</h2>
      <p className="grievance-form-sub">Configure portal settings and admin account</p>
      <Alert type={alert.type} message={alert.msg} />
      <div className="form-group"><label className="form-label">Admin Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
      <div className="form-group"><label className="form-label">Admin Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
      <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" placeholder="Enter current password" value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" placeholder="New password" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" placeholder="Confirm new password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} /></div>
      </div>
      <button className="btn-primary" onClick={save}>Save Settings</button>
    </div>
  );
}
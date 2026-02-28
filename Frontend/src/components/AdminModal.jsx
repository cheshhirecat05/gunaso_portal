import { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../utils/api';
import Alert from './Alert';

export default function AdminModal() {
  const { adminModal, setAdminModal, login } = useApp();
  const [form, setForm] = useState({ email: '', pass: '' });
  const [alert, setAlert] = useState({ type: '', msg: '' });

  const adminLoginHandler = async () => {
    if (!form.email || !form.pass) return setAlert({ type: 'error', msg: 'Please enter credentials.' });
    try {
      const data = await api.adminLogin({ email: form.email, password: form.pass });
      login({ ...data.session, token: data.token });
      setAdminModal(false);
    } catch (err) {
      setAlert({ type: 'error', msg: err.message });
    }
  };

  if (!adminModal) return null;

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setAdminModal(false)}>
      <div className="modal">
        <div className="modal-header" style={{ background: 'linear-gradient(135deg,var(--navy),var(--navy-light))' }}>
          <div className="modal-badge badge-admin">Administrator</div>
          <h2 className="modal-title">Admin Access</h2>
          <p className="modal-sub">Restricted to authorized personnel only</p>
          <button className="modal-close" onClick={() => setAdminModal(false)}>✕</button>
        </div>
        <div className="modal-body">
          <Alert type={alert.type} message={alert.msg} />
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input className="form-input" type="email" placeholder="admin@gunaso.gov.np" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.pass} onChange={e => setForm({ ...form, pass: e.target.value })} />
          </div>
          <button className="btn-primary btn-full" onClick={adminLoginHandler}>Access Admin Panel</button>
          <div className="form-footer" style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 16 }}>
            Demo: admin@gunaso.gov.np / admin123
          </div>
        </div>
      </div>
    </div>
  );
}
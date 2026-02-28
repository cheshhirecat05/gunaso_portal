import { useState } from 'react';
import { getGrievances, saveGrievances } from '../../utils/storage';
import Alert from '../../components/Alert';

export default function CDSubmit({ user }) {
  const [form, setForm] = useState({ subject: '', category: '', priority: 'Normal', location: '', desc: '' });
  const [alert, setAlert] = useState({ type: '', msg: '' });

  const submit = () => {
    const { subject, category, location, desc } = form;
    if (!subject || !category || !location || !desc) return setAlert({ type: 'error', msg: 'Please fill all required fields.' });
    const ticketNo = 'GUN-2025-' + String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
    const grievance = { ticketNo, userId: user.id, userName: user.name, ...form, status: 'Pending', date: new Date().toISOString() };
    const grievances = getGrievances();
    saveGrievances([...grievances, grievance]);
    setAlert({ type: 'success', msg: `✅ Grievance submitted! Your ticket: <strong style="font-family:'JetBrains Mono',monospace;">${ticketNo}</strong>` });
    setForm({ subject: '', category: '', priority: 'Normal', location: '', desc: '' });
  };

  return (
    <div className="grievance-form-card">
      <h2 className="grievance-form-title">Submit a New Grievance</h2>
      <p className="grievance-form-sub">Fill out the details below. All fields marked * are required.</p>
      <Alert type={alert.type} message={alert.msg} />
      <div className="form-group"><label className="form-label">Subject *</label><input className="form-input" placeholder="Brief title of your issue" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="">Select category</option>
            {['Infrastructure & Roads', 'Water & Sanitation', 'Healthcare', 'Education', 'Electricity', 'Public Safety', 'Environment', 'Other'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option>Normal</option><option>High</option><option>Urgent</option>
          </select>
        </div>
      </div>
      <div className="form-group"><label className="form-label">Location / Ward *</label><input className="form-input" placeholder="Ward number, municipality, district" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
      <div className="form-group"><label className="form-label">Description *</label><textarea className="form-input" placeholder="Describe your issue in detail..." value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} /></div>
      <div className="file-upload"><div className="file-upload-icon">📎</div><div className="file-upload-text">Click to attach photos or documents (optional)</div></div>
      <button className="btn-primary" style={{ marginTop: 24 }} onClick={submit}>Submit Grievance</button>
    </div>
  );
}
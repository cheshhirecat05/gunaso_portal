import { useState } from 'react';
import * as api from '../../utils/api';
import Alert from '../../components/Alert';

export default function CDSubmit({ user, onSubmitted }) {
  const [form, setForm] = useState({
    subject: '',
    category: '',
    priority: 'Normal',
    location: '',
    desc: '',
    attachment: null
  });

  const [alert, setAlert] = useState({ type: '', msg: '' });
  const [similar, setSimilar] = useState([]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      setAlert({
        type: 'error',
        msg: 'Only image files (JPG, PNG, WEBP) are allowed'
      });
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm(prev => ({
        ...prev,
        attachment: {
          name: file.name,
          type: file.type,
          data: reader.result
        }
      }));
    };

    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!form.subject || !form.category || !form.location || !form.desc)
      return setAlert({
        type: 'error',
        msg: 'Please fill all required fields.'
      });

    try {
      const data = await api.submitGrievance({
        ...form,
        userName: user.name,
      });

      setAlert({
        type: 'success',
        msg: `✅ ${data.message}`
      });

      // Show similar grievances detected by TF-IDF algorithm
      if (data.similarGrievances && data.similarGrievances.length > 0) {
        setSimilar(data.similarGrievances);
      } else {
        setSimilar([]);
      }

      setForm({
        subject: '',
        category: '',
        priority: 'Normal',
        location: '',
        desc: '',
        attachment: null
      });

      // Refresh parent grievance list
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setAlert({
        type: 'error',
        msg: err.message
      });
    }
  };

  return (
    <div className="grievance-form-card">
      <h2 className="grievance-form-title">
        Submit a New Grievance
      </h2>

      <Alert type={alert.type} message={alert.msg} />

      <div className="form-group">
        <label>Subject *</label>
        <input
          className="form-input"
          value={form.subject}
          onChange={e =>
            setForm({ ...form, subject: e.target.value })
          }
        />
      </div>

      <div className="form-group">
        <label>Category *</label>
        <select
          className="form-input"
          value={form.category}
          onChange={e =>
            setForm({ ...form, category: e.target.value })
          }
        >
          <option value="">Select category</option>
          <option>Healthcare</option>
          <option>Education</option>
          <option>Infrastructure</option>
          <option>Environment</option>
          <option>Other</option>
        </select>
      </div>

      <div className="form-group">
        <label>Address, Ward no, Tole *</label>
        <input
          className="form-input"
          value={form.location}
          onChange={e =>
            setForm({ ...form, location: e.target.value })
          }
        />
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          className="form-input"
          value={form.desc}
          onChange={e =>
            setForm({ ...form, desc: e.target.value })
          }
        />
      </div>

      <div className="form-group">
        <label>Attach Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
        />
      </div>

      <button className="btn-primary" onClick={submit}>
        Submit Grievance
      </button>

      {similar.length > 0 && (
        <div style={{
          marginTop: 20, padding: 16, background: '#fff8e1',
          borderRadius: 12, border: '1px solid #ffe082'
        }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#e65100' }}>
            ⚠️ Similar Grievances Detected (TF-IDF Cosine Similarity)
          </div>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>
            The following existing grievances are similar to yours:
          </div>
          {similar.map(s => (
            <div key={s.ticketNo} style={{
              background: 'white', padding: 10, borderRadius: 8,
              marginBottom: 6, fontSize: 13, display: 'flex',
              justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#888' }}>
                  {s.ticketNo}
                </span>
                <span style={{ marginLeft: 8 }}>{s.subject}</span>
                <span style={{ marginLeft: 8, fontSize: 11, color: '#888' }}>({s.status})</span>
              </div>
              <span style={{
                background: s.similarity >= 70 ? '#c62828' : '#ef6c00',
                color: 'white', padding: '2px 8px', borderRadius: 20,
                fontSize: 11, fontWeight: 600
              }}>
                {s.similarity}% match
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

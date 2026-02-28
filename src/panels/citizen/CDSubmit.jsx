import { useState } from 'react';
import { getGrievances, saveGrievances } from '../../utils/storage';
import Alert from '../../components/Alert';

export default function CDSubmit({ user }) {
  const [form, setForm] = useState({
    subject: '',
    category: '',
    priority: 'Normal',
    location: '',
    desc: '',
    attachment: null
  });

  const [alert, setAlert] = useState({ type: '', msg: '' });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      setAlert({
        type: 'error',
        msg: 'Only JPG, PNG or PDF allowed'
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

  const submit = () => {
    if (!form.subject || !form.category || !form.location || !form.desc)
      return setAlert({
        type: 'error',
        msg: 'Please fill all required fields.'
      });

    const ticketNo =
      'GUN-2025-' +
      String(Math.floor(Math.random() * 9000) + 1000);

    const grievance = {
      ticketNo,
      userId: user.id,
      userName: user.name,
      ...form,
      status: 'Pending',
      date: new Date().toISOString()
    };

    const grievances = getGrievances() || [];
    saveGrievances([...grievances, grievance]);

    setAlert({
      type: 'success',
      msg: `✅ Grievance submitted! Ticket: ${ticketNo}`
    });

    setForm({
      subject: '',
      category: '',
      priority: 'Normal',
      location: '',
      desc: '',
      attachment: null
    });
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
        <label>Attach Image or PDF</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFile}
        />
      </div>

      <button className="btn-primary" onClick={submit}>
        Submit Grievance
      </button>
    </div>
  );
}

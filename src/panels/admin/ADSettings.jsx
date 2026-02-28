export default function ADSettings() {
  return (
    <div className="grievance-form-card">
      <h2 className="grievance-form-title">System Settings</h2>
      <p className="grievance-form-sub">Configure portal settings and admin account</p>
      <div className="form-group"><label className="form-label">Admin Name</label><input className="form-input" defaultValue="System Administrator" /></div>
      <div className="form-group"><label className="form-label">Admin Email</label><input className="form-input" type="email" defaultValue="admin@gunaso.gov.np" /></div>
      <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" placeholder="Enter current password" /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" placeholder="New password" /></div>
        <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" placeholder="Confirm new password" /></div>
      </div>
      <button className="btn-primary">Save Settings</button>
    </div>
  );
}
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import * as api from '../utils/api';
import Alert from './Alert';

export default function CitizenModal() {
  const { citizenModal, setCitizenModal, login } = useApp();
  const [tab, setTab] = useState('login'); // login | register | forgot
  const [alert, setAlert] = useState({ type: '', msg: '' });
  const [fpStep, setFpStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [currentOTP, setCurrentOTP] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const intervalRef = useRef(null);

  const [loginForm, setLoginForm] = useState({ email: '', pass: '' });
  const [regForm, setRegForm] = useState({ name: '', phone: '', email: '', address: '', pass: '', pass2: '' });
  const [fpEmail, setFpEmail] = useState('');
  const [newPass, setNewPass] = useState({ pass: '', pass2: '' });

  useEffect(() => { if (!citizenModal) { setTab('login'); setAlert({ type: '', msg: '' }); setFpStep(1); } }, [citizenModal]);

  const showAlert = (type, msg) => setAlert({ type, msg });
  const hideAlert = () => setAlert({ type: '', msg: '' });

  const citizenLogin = async () => {
    const { email, pass } = loginForm;
    if (!email || !pass) return showAlert('error', 'Please fill all fields.');
    try {
      const data = await api.citizenLogin({ email, password: pass });
      login({ ...data.session, token: data.token });
      setCitizenModal(false);
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  const citizenRegister = async () => {
    const { name, phone, email, address, pass, pass2 } = regForm;
    if (!name || !phone || !email || !address || !pass) return showAlert('error', 'Please fill all required fields.');
    if (pass.length < 8) return showAlert('error', 'Password must be at least 8 characters.');
    if (pass !== pass2) return showAlert('error', 'Passwords do not match.');
    try {
      await api.citizenRegister({ name, phone, email, address, password: pass });
      showAlert('success', '✅ Account created! You can now log in.');
      setTimeout(() => setTab('login'), 1500);
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  const sendOTP = async () => {
    const email = fpEmail.trim().toLowerCase();
    if (!email) return showAlert('error', 'Please enter your email address.');
    try {
      const data = await api.forgotPassword(email);
      setPendingEmail(email);
      // In demo mode, show OTP; in production this would be sent via email
      if (data.demoOtp) {
        setCurrentOTP(data.demoOtp);
        showAlert('info', `📧 Demo OTP: <strong>${data.demoOtp}</strong> (Copy this to verify)`);
      } else {
        showAlert('info', '📧 OTP sent to your email.');
      }
      setFpStep(2);
      startResendTimer();
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const verifyOTP = async () => {
    const entered = otp.join('');
    if (entered.length < 6) return showAlert('error', 'Please enter the complete 6-digit OTP.');
    try {
      const data = await api.verifyOtp(pendingEmail, entered);
      setResetToken(data.resetToken);
      hideAlert();
      setFpStep(3);
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  const handleResetPassword = async () => {
    const { pass, pass2 } = newPass;
    if (!pass) return showAlert('error', 'Please enter a new password.');
    if (pass.length < 8) return showAlert('error', 'Password must be at least 8 characters.');
    if (pass !== pass2) return showAlert('error', 'Passwords do not match.');
    try {
      await api.resetPassword(resetToken, pass);
      showAlert('success', '✅ Password reset successfully! Please login with your new password.');
      setTimeout(() => { setTab('login'); setFpStep(1); }, 2000);
    } catch (err) {
      showAlert('error', err.message);
    }
  };

  const handleOtpInput = (val, idx) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[idx] = cleaned;
    setOtp(newOtp);
    if (cleaned && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  if (!citizenModal) return null;

  return (
    <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setCitizenModal(false)}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-badge badge-citizen">Citizen Portal</div>
          <h2 className="modal-title">Welcome Back</h2>
          <p className="modal-sub">Login or create your citizen account</p>
          <button className="modal-close" onClick={() => setCitizenModal(false)}>✕</button>
        </div>
        <div className="modal-body">
          {tab !== 'forgot' && (
            <div className="modal-tabs">
              <button className={`modal-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); hideAlert(); }}>Login</button>
              <button className={`modal-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); hideAlert(); }}>Register</button>
            </div>
          )}
          <Alert type={alert.type} message={alert.msg} />

          {/* LOGIN */}
          {tab === 'login' && (
            <div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="registered@email.com" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="••••••••" value={loginForm.pass} onChange={e => setLoginForm({ ...loginForm, pass: e.target.value })} />
              </div>
              <button className="btn-primary btn-full" onClick={citizenLogin}>Login to Portal</button>
              <div className="form-footer">
                <button className="link-btn" onClick={() => { setTab('forgot'); hideAlert(); }}>Forgot Password?</button>
              </div>
            </div>
          )}

          {/* REGISTER */}
          {tab === 'register' && (
            <div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" placeholder="Ram Bahadur" value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Phone *</label><input className="form-input" placeholder="98XXXXXXXX" value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">Email Address *</label><input className="form-input" type="email" placeholder="your@email.com" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Address / Ward *</label><input className="form-input" placeholder="Ward, Municipality, District" value={regForm.address} onChange={e => setRegForm({ ...regForm, address: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Password *</label><input className="form-input" type="password" placeholder="Min. 8 characters" value={regForm.pass} onChange={e => setRegForm({ ...regForm, pass: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Confirm Password *</label><input className="form-input" type="password" placeholder="Confirm" value={regForm.pass2} onChange={e => setRegForm({ ...regForm, pass2: e.target.value })} /></div>
              </div>
              <button className="btn-primary btn-full" onClick={citizenRegister}>Create Account</button>
              <div className="form-footer" style={{ fontSize: 12, color: 'var(--text-light)' }}>By registering, you agree to our Terms of Use</div>
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <div>
              {fpStep === 1 && (
                <div>
                  <p style={{ fontSize: 14, color: 'var(--text-mid)', marginBottom: 20 }}>Enter your registered email. We'll send a 6-digit OTP to reset your password.</p>
                  <div className="form-group"><label className="form-label">Registered Email</label><input className="form-input" type="email" placeholder="your@email.com" value={fpEmail} onChange={e => setFpEmail(e.target.value)} /></div>
                  <button className="btn-primary btn-full" onClick={sendOTP}>Send OTP via Email</button>
                  <div className="form-footer"><button className="link-btn" onClick={() => setTab('login')}>← Back to Login</button></div>
                </div>
              )}
              {fpStep === 2 && (
                <div>
                  <div className="progress-steps">
                    <div className="prog-step"><div className="prog-dot done">✓</div><div className="prog-label">Email</div></div>
                    <div className="prog-step"><div className="prog-dot active">2</div><div className="prog-label">Verify OTP</div></div>
                    <div className="prog-step"><div className="prog-dot">3</div><div className="prog-label">New Password</div></div>
                  </div>
                  <p style={{ fontSize: 14, textAlign: 'center', marginBottom: 12, color: 'var(--text-mid)' }}>Enter the 6-digit OTP</p>
                  <div className="otp-inputs">
                    {otp.map((v, i) => (
                      <input key={i} id={`otp-${i}`} className="otp-input" maxLength={1} value={v} onChange={e => handleOtpInput(e.target.value, i)} />
                    ))}
                  </div>
                  <div className="resend-timer">
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : <button className="link-btn" onClick={async () => {
                      try {
                        const data = await api.forgotPassword(pendingEmail);
                        if (data.demoOtp) {
                          setCurrentOTP(data.demoOtp);
                          showAlert('info', `New OTP: <strong>${data.demoOtp}</strong>`);
                        }
                        startResendTimer();
                      } catch (err) {
                        showAlert('error', err.message);
                      }
                    }}>Resend OTP</button>}
                  </div>
                  <button className="btn-primary btn-full" style={{ marginTop: 12 }} onClick={verifyOTP}>Verify OTP</button>
                </div>
              )}
              {fpStep === 3 && (
                <div>
                  <div className="progress-steps">
                    <div className="prog-step"><div className="prog-dot done">✓</div><div className="prog-label">Email</div></div>
                    <div className="prog-step"><div className="prog-dot done">✓</div><div className="prog-label">Verify OTP</div></div>
                    <div className="prog-step"><div className="prog-dot active">3</div><div className="prog-label">New Password</div></div>
                  </div>
                  <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" placeholder="Minimum 8 characters" value={newPass.pass} onChange={e => setNewPass({ ...newPass, pass: e.target.value })} /></div>
                  <div className="form-group"><label className="form-label">Confirm New Password</label><input className="form-input" type="password" placeholder="Confirm new password" value={newPass.pass2} onChange={e => setNewPass({ ...newPass, pass2: e.target.value })} /></div>
                  <button className="btn-primary btn-full" onClick={handleResetPassword}>Reset Password</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
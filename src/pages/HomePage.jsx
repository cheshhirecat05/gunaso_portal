import { useApp } from '../context/AppContext';
import Footer from '../components/Footer';
import { useState } from 'react';
import { getGrievances } from '../utils/storage';
import Badge from '../components/Badge';
import Alert from '../components/Alert';

export default function HomePage() {
  const { setCitizenModal } = useApp();
  const [trackInput, setTrackInput] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', subject: '', msg: '' });
  const [contactAlert, setContactAlert] = useState({ type: '', msg: '' });

  const trackTicket = () => {
    const val = trackInput.trim().toUpperCase();
    if (!val) return;
    const grievances = getGrievances();
    const g = grievances.find(gr => gr.ticketNo.toUpperCase() === val);
    if (!g) { setTrackResult({ error: `No ticket found with number "${val}".` }); return; }
    setTrackResult(g);
  };

  const submitContact = () => {
    const { name, email, subject, msg } = contactForm;
    if (!name || !email || !subject || !msg) return setContactAlert({ type: 'error', msg: 'Please fill all required fields.' });
    setContactAlert({ type: 'success', msg: "✅ Message sent! We'll respond within 24 hours." });
    setContactForm({ name: '', phone: '', email: '', subject: '', msg: '' });
  };

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <div className="hero-inner">
            {/* <div className="hero-badge">🇳🇵 &nbsp; Government of Nepal</div> */}
            <div className="hero-nepali">गुनासो पोर्टल</div>
            <h1 className="hero-title">Your Voice.<br /><span>Their Action.</span></h1>
            <p className="hero-desc">Submit, track, and resolve civic grievances through Nepal's official digital platform. Every complaint matters. Every issue gets addressed.</p>
            <div className="hero-cta">
              <button className="btn-primary" onClick={() => setCitizenModal(true)}>Submit a Grievance</button>
              <button className="btn-secondary" onClick={() => document.getElementById('track-section')?.scrollIntoView({ behavior: 'smooth' })}>Track Your Ticket</button>
            </div>
          </div>
        </div>
        <div className="stats-bar">
          <div className="stat-item"><div className="stat-num">24,891</div><div className="stat-label">Grievances Filed</div></div>
          <div className="stat-item"><div className="stat-num">91.4%</div><div className="stat-label">Resolution Rate</div></div>
          <div className="stat-item"><div className="stat-num">4.8d</div><div className="stat-label">Avg. Resolution</div></div>
          <div className="stat-item"><div className="stat-num">77</div><div className="stat-label">Departments</div></div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section section-light" id="how-it-works">
        <div className="section-header">
          <div className="section-badge">Process</div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-sub">Simple. Fast. Accountable. Three steps to get your civic issue noticed, tracked, and resolved.</p>
        </div>
        <div className="steps-grid">
          {[
            { num: '01', icon: '📝', title: 'Submit Your Grievance', desc: 'Register and log in as a citizen. Fill out the grievance form with your issue details, location, category, and supporting evidence.' },
            { num: '02', icon: '🔄', title: 'Track Progress', desc: 'Use your unique ticket number to monitor real-time status updates as your complaint moves through the review pipeline.' },
            { num: '03', icon: '✅', title: 'Get Resolution', desc: 'Receive official responses from departments. Confirm resolution or escalate if your issue hasn\'t been addressed satisfactorily.' },
          ].map(s => (
            <div className="step-card" key={s.num}>
              <div className="step-num">{s.num}</div>
              <span className="step-icon">{s.icon}</span>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Track Section */}
      <div id="track-section">
        <div className="track-box">
          <div className="section-badge" style={{ display: 'inline-block', marginBottom: 16 }}>Track</div>
          <h2 className="section-title" style={{ fontSize: 32 }}>Track Your Ticket</h2>
          <p style={{ color: 'var(--text-mid)', marginBottom: 28 }}>Enter your ticket number to check the current status of your grievance.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <input className="form-input" placeholder="e.g. GUN-2025-0041" style={{ flex: 1 }} value={trackInput} onChange={e => setTrackInput(e.target.value)} />
            <button className="btn-primary" onClick={trackTicket}>Track</button>
          </div>
          {trackResult && (
            <div className="track-result">
              {trackResult.error
                ? <div className="alert alert-error">{trackResult.error}</div>
                : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: 'var(--text-light)', marginBottom: 4 }}>{trackResult.ticketNo}</div>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: 'var(--navy)' }}>{trackResult.subject}</div>
                      </div>
                      <Badge status={trackResult.status} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {[['Category', trackResult.category], ['Priority', trackResult.priority], ['Location', trackResult.location], ['Submitted', new Date(trackResult.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })]].map(([label, val]) => (
                        <div key={label}>
                          <div style={{ fontSize: 11, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
                          <div style={{ fontWeight: 600, marginTop: 4 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Contact */}
      <section className="section section-dark" id="contact">
        <div className="section-header">
          <div className="section-badge section-badge-gold">Support</div>
          <h2 className="section-title section-title-light">Get In Touch</h2>
          <p className="section-sub section-sub-light">Reach out through any of the channels below for assistance with your grievance.</p>
        </div>
        <div className="contact-grid">
          <div>
            <div className="contact-cards">
              {[
                { icon: '📞', type: 'Hotline Service', val: '1180', note: 'Available 24/7' },
                { icon: '📱', type: 'Toll Free', val: '1660-01-05511', note: 'Sun–Fri, 10AM–5PM' },
                { icon: '💬', type: 'WhatsApp', val: '9768988881', note: 'Quick submissions' },
                { icon: '📧', type: 'Email Support', val: 'info@gunaso.gov.np', note: 'Formal requests' },
              ].map(c => (
                <div className="contact-card" key={c.type}>
                  <div className="contact-icon">{c.icon}</div>
                  <div className="contact-type">{c.type}</div>
                  <div className="contact-value">{c.val}</div>
                  <div className="contact-note">{c.note}</div>
                </div>
              ))}
            </div>
            <div className="office-info">
              <h3 className="office-title">Office Information</h3>
              {[
                { icon: '📍', label: 'Location', val: 'City Hall, Civic Square, Metropolitan Area' },
                { icon: '🕙', label: 'Office Hours', val: 'Sunday – Friday: 10:00 AM – 5:00 PM' },
                { icon: '🌐', label: 'Digital Presence', val: 'Available online 24 hours a day' },
              ].map(o => (
                <div className="office-item" key={o.label}>
                  <div className="office-item-icon">{o.icon}</div>
                  <div><div className="office-item-label">{o.label}</div><div className="office-item-value">{o.val}</div></div>
                </div>
              ))}
            </div>
          {/* {/* </div>
          <div className="contact-form-wrap">
            <h3 className="contact-form-title">Send Us a Message</h3>
            <p className="contact-form-sub">We'll respond within 24 business hours</p>
            <Alert type={contactAlert.type} message={contactAlert.msg} />
            <div className="form-row">
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" placeholder="Ram Bahadur" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="98XXXXXXXX" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="you@example.com" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Subject</label><input className="form-input" placeholder="Brief subject" value={contactForm.subject} onChange={e => setContactForm({ ...contactForm, subject: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Message</label><textarea className="form-input" placeholder="Describe your issue..." value={contactForm.msg} onChange={e => setContactForm({ ...contactForm, msg: e.target.value })} /></div>
            <button className="btn-primary btn-full" onClick={submitContact}>Send Message →</button>
           </div>  */}
        </div> */}
      </section>

      <Footer />
    </>
  );
}

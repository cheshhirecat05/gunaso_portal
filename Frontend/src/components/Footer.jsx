import { useApp } from '../context/AppContext';

export default function Footer() {
  const { setCitizenModal } = useApp();
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="nav-logo">G</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: 'var(--cream)' }}>Gunaso Portal</div>
              <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 2, textTransform: 'uppercase' }}>गुनासो पोर्टल</div>
            </div>
          </div>
          <p>Gunaso Portal is the central grievance management system, resolving issues through digital channels while ensuring accountability and citizen satisfaction.</p>
        </div>
        <div>
          <div className="footer-col-title">Quick Links</div>
          <span className="footer-link" onClick={() => setCitizenModal(true)}>Submit Grievance</span>
          <span className="footer-link" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Contact Us</span>
          <a className="footer-link" href="#">Privacy Policy</a>
        </div>
        <div>
          <div className="footer-col-title">Resources</div>
          <a className="footer-link" href="#">FAQ</a>
          <a className="footer-link" href="#">User Guide</a>
          <a className="footer-link" href="#">Terms of Use</a>
          <a className="footer-link" href="#">Official Website</a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">© 2025 CivicVoice / Gunaso Portal. All rights reserved.</div>
        <div className="footer-flag">🇳🇵</div>
      </div>
    </footer>
  );
}
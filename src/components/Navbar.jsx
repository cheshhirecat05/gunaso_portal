import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { setCitizenModal, setAdminModal, setView } = useApp();

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => setView('home')}>
        <div className="nav-logo">G</div>
        <div>
          <div className="nav-title">Gunaso</div>
          <div className="nav-sub">Grievance Portal</div>
        </div>
      </div>
      <div className="nav-links">
        <button className="nav-link" onClick={() => setView('home')}>Home</button>
        <button className="nav-link" onClick={() => {
          setView('home');
          setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }}>How It Works</button>
        <button className="nav-link" onClick={() => {
          setView('home');
          setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }}>Contact</button>
        <button className="nav-link btn-login-citizen" onClick={() => setCitizenModal(true)}>Citizen Login</button>
        <button className="nav-link btn-login-admin" onClick={() => setAdminModal(true)}>Admin Login</button>
      </div>
    </nav>
  );
}
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CitizenModal from './components/CitizenModal';
import AdminModal from './components/AdminModal';

export default function App() {
  const { view } = useApp();

  return (
    <>
      {view === 'home' && <Navbar />}
      {view === 'home' && <HomePage />}
      {view === 'citizen-dash' && <CitizenDashboard />}
      {view === 'admin-dash' && <AdminDashboard />}
      <CitizenModal />
      <AdminModal />
    </>
  );
}
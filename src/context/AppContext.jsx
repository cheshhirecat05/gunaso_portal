import { createContext, useContext, useState, useEffect } from 'react';
import { getSession, setSession, clearSession } from '../utils/storage';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [view, setView] = useState('home'); // 'home' | 'citizen-dash' | 'admin-dash'
  const [session, setSessionState] = useState(null);
  const [citizenModal, setCitizenModal] = useState(false);
  const [adminModal, setAdminModal] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (s) {
      setSessionState(s);
      if (s.type === 'citizen') setView('citizen-dash');
      else if (s.type === 'admin') setView('admin-dash');
    }
  }, []);

  const login = (sessionData) => {
    setSession(sessionData);
    setSessionState(sessionData);
    if (sessionData.type === 'citizen') setView('citizen-dash');
    else setView('admin-dash');
  };

  const logout = () => {
    clearSession();
    setSessionState(null);
    setView('home');
  };

  return (
    <AppContext.Provider value={{ view, setView, session, login, logout, citizenModal, setCitizenModal, adminModal, setAdminModal }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
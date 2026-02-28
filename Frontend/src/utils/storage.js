export const getSession = () => JSON.parse(localStorage.getItem('gunaso_session') || 'null');
export const setSession = (s) => localStorage.setItem('gunaso_session', JSON.stringify(s));
export const clearSession = () => localStorage.removeItem('gunaso_session');
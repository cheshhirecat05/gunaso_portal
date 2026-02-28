export const getUsers = () => JSON.parse(localStorage.getItem('gunaso_users') || '[]');
export const saveUsers = (users) => localStorage.setItem('gunaso_users', JSON.stringify(users));
export const getGrievances = () => JSON.parse(localStorage.getItem('gunaso_grievances') || '[]');
export const saveGrievances = (g) => localStorage.setItem('gunaso_grievances', JSON.stringify(g));
export const getSession = () => JSON.parse(localStorage.getItem('gunaso_session') || 'null');
export const setSession = (s) => localStorage.setItem('gunaso_session', JSON.stringify(s));
export const clearSession = () => localStorage.removeItem('gunaso_session');
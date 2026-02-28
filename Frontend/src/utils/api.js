const API_BASE = '/api';

function getToken() {
  const session = JSON.parse(localStorage.getItem('gunaso_session') || 'null');
  return session?.token || null;
}

function authHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request(method, url, body = null) {
  const opts = {
    method,
    headers: authHeaders(),
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${url}`, opts);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }

  return data;
}

// ─── Auth ───
export const citizenRegister = (body) => request('POST', '/auth/citizen/register', body);
export const citizenLogin = (body) => request('POST', '/auth/citizen/login', body);
export const adminLogin = (body) => request('POST', '/auth/admin/login', body);
export const forgotPassword = (email) => request('POST', '/auth/citizen/forgot-password', { email });
export const verifyOtp = (email, otp) => request('POST', '/auth/citizen/verify-otp', { email, otp });
export const resetPassword = (resetToken, password) => request('POST', '/auth/citizen/reset-password', { resetToken, password });
export const getMe = () => request('GET', '/auth/me');

// ─── Grievances ───
export const submitGrievance = (body) => request('POST', '/grievances', body);
export const getMyGrievances = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request('GET', `/grievances/my${query ? `?${query}` : ''}`);
};
export const updateGrievance = (ticketNo, body) => request('PUT', `/grievances/${encodeURIComponent(ticketNo)}`, body);
export const trackGrievance = (ticketNo) => request('GET', `/grievances/track/${encodeURIComponent(ticketNo)}`);
export const getAllGrievances = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request('GET', `/grievances${query ? `?${query}` : ''}`);
};
export const updateGrievanceStatus = (ticketNo, status) => request('PUT', `/grievances/${encodeURIComponent(ticketNo)}/status`, { status });

// ─── Citizens ───
export const getAllCitizens = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request('GET', `/citizens${query ? `?${query}` : ''}`);
};
export const getProfile = () => request('GET', '/citizens/profile');
export const updateProfile = (body) => request('PUT', '/citizens/profile', body);

// ─── Stats ───
export const getDashboardStats = () => request('GET', '/stats');
export const getReportsData = () => request('GET', '/stats/reports');

// ─── Algorithms ───
export const checkSimilar = (body) => request('POST', '/grievances/check-similar', body);
export const getRankedGrievances = () => request('GET', '/grievances/ranked');

// ─── Settings ───
export const getSettings = () => request('GET', '/settings');
export const updateSettings = (body) => request('PUT', '/settings', body);

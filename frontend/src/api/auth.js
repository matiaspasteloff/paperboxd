import { call, h, BASE } from './client';

export const register = (body) =>
  call(`${BASE}/users/`, { method: 'POST', headers: h(), body: JSON.stringify(body) });

export const login = async (email, pw) => {
  const form = new FormData();
  form.append('username', email);
  form.append('password', pw);
  return call(`${BASE}/login`, { method: 'POST', body: form });
};

export const getMe = (token) =>
  call(`${BASE}/me`, { headers: h(token) });

export const updateMe = (token, body) =>
  call(`${BASE}/me`, { method: 'PATCH', headers: h(token), body: JSON.stringify(body) });

// ── Google OAuth ──────────────────────────────────────────────────────────────
export const googleLogin = (idToken) =>
  call(`${BASE}/auth/google`, {
    method: 'POST',
    headers: h(),
    body: JSON.stringify({ id_token: idToken }),
  });
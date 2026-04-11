import { call, h, BASE } from './client';

// ── Progress ──────────────────────────────────────────────────────────────────
export const addProgress = (token, body) =>
  call(`${BASE}/progress/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) });

export const getProgress = (token) =>
  call(`${BASE}/progress/`, { headers: h(token) });

export const updateProgress = (token, id, body) =>
  call(`${BASE}/progress/${id}`, { method: 'PATCH', headers: h(token), body: JSON.stringify(body) });

export const deleteProgress = (token, id) =>
  call(`${BASE}/progress/${id}`, { method: 'DELETE', headers: h(token) });

// ── DNF ───────────────────────────────────────────────────────────────────────
export const addDNF = (token, body) =>
  call(`${BASE}/dnf/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) });

export const getDNF = (token) =>
  call(`${BASE}/dnf/`, { headers: h(token) });

export const deleteDNF = (token, id) =>
  call(`${BASE}/dnf/${id}`, { method: 'DELETE', headers: h(token) });

// ── Quotes ────────────────────────────────────────────────────────────────────
export const addQuote = (token, body) =>
  call(`${BASE}/quotes/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) });

export const getQuotes = (token) =>
  call(`${BASE}/quotes/`, { headers: h(token) });

export const deleteQuote = (token, id) =>
  call(`${BASE}/quotes/${id}`, { method: 'DELETE', headers: h(token) });

// ── Lists ─────────────────────────────────────────────────────────────────────
export const getPublicLists = () =>
  call(`${BASE}/lists/`);

export const getMyLists = (token) =>
  call(`${BASE}/lists/my`, { headers: h(token) });

export const createList = (token, body) =>
  call(`${BASE}/lists/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) });

export const addToList = (token, id, body) =>
  call(`${BASE}/lists/${id}/items`, { method: 'POST', headers: h(token), body: JSON.stringify(body) });

export const toggleLike = (token, id) =>
  call(`${BASE}/lists/${id}/like`, { method: 'POST', headers: h(token) });

// ── Clubs ─────────────────────────────────────────────────────────────────────
export const getClubs = () =>
  call(`${BASE}/clubs/`);

export const createClub = (token, body) =>
  call(`${BASE}/clubs/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) });

export const getMessages = (cid, ch) =>
  call(`${BASE}/clubs/${cid}/messages${ch ? `?chapter=${ch}` : ''}`);

export const postMessage = (token, id, body) =>
  call(`${BASE}/clubs/${id}/messages`, { method: 'POST', headers: h(token), body: JSON.stringify(body) });

// ── Stats & Recommendations ───────────────────────────────────────────────────
export const getStats = (token) =>
  call(`${BASE}/stats/`, { headers: h(token) });

export const getRecommendations = (token) =>
  call(`${BASE}/recommendations/`, { headers: h(token) });
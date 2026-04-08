import { adaptGoogleBook, SUBJECT_QUERY_MAP } from './utils/googleBooks';

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const BASE = import.meta.env.VITE_API_BASE_URL || 'https://paperboxd-backend.onrender.com';
const GB = 'https://www.googleapis.com/books/v1';

const h = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const call = async (url, opts = {}, retries = 1) => {
  try {
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Error del servidor');
    return data;
  } catch (err) {
    // Render free tier cold start: retry once after 3s
    if (retries > 0 && (err.message === 'Failed to fetch' || err.name === 'TypeError')) {
      await new Promise(r => setTimeout(r, 3000));
      return call(url, opts, retries - 1);
    }
    throw err;
  }
};

/** Fetch from Google Books and return adapted books, filtered to those with covers */
const gbFetch = async (params, maxResults = 16) => {
  const qs = new URLSearchParams({
    printType: 'books',
    maxResults: String(maxResults),
    key: API_KEY,
    ...params,
  });
  try {
    const r = await fetch(`${GB}/volumes?${qs}`);
    const d = await r.json();
    return (d.items || [])
      .map(adaptGoogleBook)
      .filter(b => b && b.cover_url);
  } catch {
    return [];
  }
};

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  register: (body) => call(`${BASE}/users/`, { method: 'POST', headers: h(), body: JSON.stringify(body) }),
  login: async (email, pw) => {
    const form = new FormData();
    form.append('username', email); form.append('password', pw);
    return call(`${BASE}/login`, { method: 'POST', body: form });
  },
  getMe: (token) => call(`${BASE}/me`, { headers: h(token) }),
  updateMe: (token, body) => call(`${BASE}/me`, { method: 'PATCH', headers: h(token), body: JSON.stringify(body) }),

  // ── Social ────────────────────────────────────────────────────────────────
  searchUsers: (q) => call(`${BASE}/users/search?q=${encodeURIComponent(q)}`),
  getProfile: (username, token) => call(`${BASE}/users/${username}`, { headers: h(token) }),
  getUserReviews: (username) => call(`${BASE}/users/${username}/reviews`),
  toggleFollow: (token, username) => call(`${BASE}/users/${username}/follow`, { method: 'POST', headers: h(token) }),
  getFollowers: (username) => call(`${BASE}/users/${username}/followers`),
  getFollowing: (username) => call(`${BASE}/users/${username}/following`),
  getFeed: (token) => call(`${BASE}/feed/`, { headers: h(token) }),

  // ── Reviews ───────────────────────────────────────────────────────────────
  getBookReviews: (workId) => call(`${BASE}/books/${workId}/reviews`),
  createReview: (token, body) => call(`${BASE}/my-reviews/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) }),
  getMyReviews: (token) => call(`${BASE}/my-reviews/`, { headers: h(token) }),

  // ── Progress ──────────────────────────────────────────────────────────────
  addProgress: (token, body) => call(`${BASE}/progress/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) }),
  getProgress: (token) => call(`${BASE}/progress/`, { headers: h(token) }),
  updateProgress: (token, id, b) => call(`${BASE}/progress/${id}`, { method: 'PATCH', headers: h(token), body: JSON.stringify(b) }),
  deleteProgress: (token, id) => call(`${BASE}/progress/${id}`, { method: 'DELETE', headers: h(token) }),

  // ── DNF ───────────────────────────────────────────────────────────────────
  addDNF: (token, body) => call(`${BASE}/dnf/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) }),
  getDNF: (token) => call(`${BASE}/dnf/`, { headers: h(token) }),
  deleteDNF: (token, id) => call(`${BASE}/dnf/${id}`, { method: 'DELETE', headers: h(token) }),

  // ── Quotes ────────────────────────────────────────────────────────────────
  addQuote: (token, body) => call(`${BASE}/quotes/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) }),
  getQuotes: (token) => call(`${BASE}/quotes/`, { headers: h(token) }),
  deleteQuote: (token, id) => call(`${BASE}/quotes/${id}`, { method: 'DELETE', headers: h(token) }),

  // ── Lists ─────────────────────────────────────────────────────────────────
  getPublicLists: () => call(`${BASE}/lists/`),
  getMyLists: (token) => call(`${BASE}/lists/my`, { headers: h(token) }),
  createList: (token, body) => call(`${BASE}/lists/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) }),
  addToList: (token, id, b) => call(`${BASE}/lists/${id}/items`, { method: 'POST', headers: h(token), body: JSON.stringify(b) }),
  toggleLike: (token, id) => call(`${BASE}/lists/${id}/like`, { method: 'POST', headers: h(token) }),

  // ── Clubs ─────────────────────────────────────────────────────────────────
  getClubs: () => call(`${BASE}/clubs/`),
  createClub: (token, body) => call(`${BASE}/clubs/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) }),
  getMessages: (cid, ch) => call(`${BASE}/clubs/${cid}/messages${ch ? `?chapter=${ch}` : ''}`),
  postMessage: (token, id, b) => call(`${BASE}/clubs/${id}/messages`, { method: 'POST', headers: h(token), body: JSON.stringify(b) }),

  // ── Stats & Recommendations ───────────────────────────────────────────────
  getStats: (token) => call(`${BASE}/stats/`, { headers: h(token) }),
  getRecommendations: (token) => call(`${BASE}/recommendations/`, { headers: h(token) }),

  // ── Google Books API ──────────────────────────────────────────────────────
  searchBooks: async (q) => {
    const books = await gbFetch({ q: q.trim(), orderBy: 'relevance' }, 16);
    return { docs: books };
  },

  getTrending: async () => {
    const books = await gbFetch({ q: 'bestseller fiction 2024', orderBy: 'relevance' }, 16);
    return { works: books };
  },

  getSubject: async (s) => {
    const q = SUBJECT_QUERY_MAP[s] || `subject:${s}`;
    const books = await gbFetch({ q, orderBy: 'relevance' }, 8);
    return { works: books };
  },

  getBookDetails: async (volumeId) => {
    try {
      const r = await fetch(`${GB}/volumes/${volumeId}?key=${API_KEY}`);
      if (!r.ok) return null;
      return adaptGoogleBook(await r.json());
    } catch {
      return null;
    }
  },
};
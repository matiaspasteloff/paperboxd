const BASE = 'http://localhost:8000';


const h = (token) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

const call = async (url, opts = {}) => {
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Error del servidor');
    return data;
};

export const api = {
    // Auth
    register: (body) => call(`${BASE}/users/`, { method: 'POST', headers: h(), body: JSON.stringify(body) }),
    login: async (email, pw) => {
        const form = new FormData();
        form.append('username', email); form.append('password', pw);
        return call(`${BASE}/login`, { method: 'POST', body: form });
    },
    getMe: (token) => call(`${BASE}/me`, { headers: h(token) }),
    updateMe: (token, body) => call(`${BASE}/me`, { method: 'PATCH', headers: h(token), body: JSON.stringify(body) }),

    // Reviews
    getBookReviews: (workId) => call(`${BASE}/books/${workId}/reviews`),
    createReview: (token, body) => call(`${BASE}/my-reviews/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) }),
    getMyReviews: (token) => call(`${BASE}/my-reviews/`, { headers: h(token) }),

    // Progress
    addProgress: (token, body) => call(`${BASE}/progress/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) }),
    getProgress: (token) => call(`${BASE}/progress/`, { headers: h(token) }),
    updateProgress: (token, id, b) => call(`${BASE}/progress/${id}`, { method: 'PATCH', headers: h(token), body: JSON.stringify(b) }),
    deleteProgress: (token, id) => call(`${BASE}/progress/${id}`, { method: 'DELETE', headers: h(token) }),

    // DNF
    addDNF: (token, body) => call(`${BASE}/dnf/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) }),
    getDNF: (token) => call(`${BASE}/dnf/`, { headers: h(token) }),
    deleteDNF: (token, id) => call(`${BASE}/dnf/${id}`, { method: 'DELETE', headers: h(token) }),

    // Quotes
    addQuote: (token, body) => call(`${BASE}/quotes/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) }),
    getQuotes: (token) => call(`${BASE}/quotes/`, { headers: h(token) }),
    deleteQuote: (token, id) => call(`${BASE}/quotes/${id}`, { method: 'DELETE', headers: h(token) }),

    // Lists
    getPublicLists: () => call(`${BASE}/lists/`),
    getMyLists: (token) => call(`${BASE}/lists/my`, { headers: h(token) }),
    createList: (token, body) => call(`${BASE}/lists/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) }),
    addToList: (token, id, b) => call(`${BASE}/lists/${id}/items`, { method: 'POST', headers: h(token), body: JSON.stringify(b) }),
    toggleLike: (token, id) => call(`${BASE}/lists/${id}/like`, { method: 'POST', headers: h(token) }),

    // Clubs
    getClubs: () => call(`${BASE}/clubs/`),
    createClub: (token, body) => call(`${BASE}/clubs/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) }),
    getMessages: (clubId, ch) => call(`${BASE}/clubs/${clubId}/messages${ch ? `?chapter=${ch}` : ''}`),
    postMessage: (token, id, b) => call(`${BASE}/clubs/${id}/messages`, { method: 'POST', headers: h(token), body: JSON.stringify(b) }),

    // Stats
    getStats: (token) => call(`${BASE}/stats/`, { headers: h(token) }),

    // OpenLibrary
    searchBooks: (q) => fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=16&fields=key,title,author_name,cover_i,first_publish_year,subject`).then(r => r.json()),
    getTrending: () => fetch(`https://openlibrary.org/trending/weekly.json?limit=12`).then(r => r.json()),
    getSubject: (s) => fetch(`https://openlibrary.org/subjects/${s}.json?limit=8`).then(r => r.json()),
};

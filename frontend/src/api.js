const BASE_URL = 'https://paperboxd-backend.onrender.com';

export const api = {
    register: async ({ username, email, password }) => {
        const res = await fetch(`${BASE_URL}/users/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Error al registrarse');
        return data;
    },

    login: async (email, password) => {
        const form = new FormData();
        form.append('username', email);
        form.append('password', password);
        const res = await fetch(`${BASE_URL}/login`, { method: 'POST', body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Email o contraseña incorrectos');
        return data;
    },

    getMyReviews: async (token) => {
        const res = await fetch(`${BASE_URL}/my-reviews/`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Error al cargar reseñas');
        return data;
    },

    createReview: async (token, { open_library_work_id, rating, review_text }) => {
        const res = await fetch(`${BASE_URL}/my-reviews/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ open_library_work_id, rating, review_text }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Error al guardar reseña');
        return data;
    },

    // Reseñas públicas de un libro (todas las personas)
    getBookReviews: async (workId) => {
        const res = await fetch(`${BASE_URL}/books/${workId}/reviews`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Error al cargar reseñas');
        return data;
    },

    searchBooks: async (query) => {
        const res = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=16&fields=key,title,author_name,cover_i,first_publish_year`
        );
        return res.json();
    },

    getBookDetails: async (workId) => {
        const res = await fetch(`https://openlibrary.org/works/${workId}.json`);
        if (!res.ok) return null;
        return res.json();
    },
};
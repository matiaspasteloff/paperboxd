const BASE = import.meta.env.VITE_API_BASE_URL || 'https://paperboxd-backend.onrender.com';

export const h = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const call = async (url, opts = {}, retries = 1) => {
  try {
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Error del servidor');
    return data;
  } catch (err) {
    if (retries > 0 && (err.message === 'Failed to fetch' || err.name === 'TypeError')) {
      await new Promise(r => setTimeout(r, 3000));
      return call(url, opts, retries - 1);
    }
    throw err;
  }
};

export { BASE };
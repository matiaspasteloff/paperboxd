import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import BookDetail from './pages/BookDetail';
import './index.css';

const TOKEN_KEY = 'paperboxd_token';
const USER_KEY = 'paperboxd_user';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
}

export default function App() {
  // page = { name: 'home' | 'dashboard' | 'book', data: any }
  const [page, setPage] = useState({ name: 'home', data: null });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [showAuth, setShowAuth] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (token) {
      const p = parseJwt(token);
      if (!p || p.exp * 1000 < Date.now()) logout();
    }
  }, []);

  const navigate = (name, data = null) => {
    setPage({ name, data });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = (accessToken) => {
    const payload = parseJwt(accessToken);
    const email = payload?.sub || '';
    const username = email.split('@')[0];
    const userData = { email, username };

    setToken(accessToken);
    setUser(userData);
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setShowAuth(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    navigate('home');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const shared = { user, token, navigate, onAuthClick: () => setShowAuth(true) };

  return (
    <>
      <Navbar
        user={user}
        page={page}
        navigate={navigate}
        onAuthClick={() => setShowAuth(true)}
        onLogout={logout}
      />

      {page.name === 'home' && <Home {...shared} />}

      {page.name === 'dashboard' && user && <Dashboard {...shared} />}

      {page.name === 'book' && page.data && (
        <BookDetail book={page.data} {...shared} />
      )}

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onSuccess={login} />
      )}
    </>
  );
}
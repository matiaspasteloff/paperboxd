import { useState, useEffect, createContext, useContext } from 'react';
import Navbar      from './components/Navbar/Navbar';
import AuthModal   from './components/AuthModal';
import Home        from './pages/Home/Home';
import Dashboard   from './pages/Dashboard/Dashboard';
import BookDetail  from './pages/BookDetail/BookDetail';
import Explore     from './pages/Explore';
import Lists       from './pages/Lists';
import Clubs       from './pages/Clubs/Clubs';
import Profile     from './pages/Profile/Profile';
import './index.css';

const TOKEN_KEY = 'pb_token';
const USER_KEY  = 'pb_user';
const THEME_KEY = 'pb_theme';

export const ThemeCtx = createContext({ theme: 'dark-blue', setTheme: () => {} });
export const useTheme = () => useContext(ThemeCtx);

function parseJwt(t) {
  try { return JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); }
  catch { return null; }
}

function useDynamicSEO(page, user) {
  useEffect(() => {
    const PAGE_TITLES = {
      home:      'PaperBoxd – Tu diario de lectura personal',
      explore:   'Explorar libros – PaperBoxd',
      lists:     'Listas temáticas – PaperBoxd',
      clubs:     'Clubes de Lectura – PaperBoxd',
      dashboard: user ? `@${user.username} · Mi biblioteca – PaperBoxd` : 'Mi biblioteca – PaperBoxd',
    };

    let title = PAGE_TITLES[page.name] || 'PaperBoxd';
    if (page.name === 'book'    && page.data?.title) title = `${page.data.title} – PaperBoxd`;
    if (page.name === 'profile' && page.data)        title = `@${page.data} – PaperBoxd`;

    document.title = title;
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
  }, [page, user]);
}

export default function App() {
  const [theme,    setThemeState] = useState(() => localStorage.getItem(THEME_KEY) || 'dark-blue');
  const [page,     setPage]       = useState({ name: 'home', data: null });
  const [token,    setToken]      = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user,     setUser]       = useState(() => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } });
  const [showAuth, setShowAuth]   = useState(false);

  useDynamicSEO(page, user);

  const setTheme = (t) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
    document.documentElement.setAttribute('data-theme', t);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
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
    const payload  = parseJwt(accessToken);
    const email    = payload?.sub || '';
    const userData = { email, username: email.split('@')[0] };
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setShowAuth(false);
  };

  const logout = () => {
    setToken(null); setUser(null); navigate('home');
    localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  };

  const shared = { user, token, navigate, onAuthClick: () => setShowAuth(true), updateUser };

  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      <Navbar user={user} page={page} navigate={navigate} onAuthClick={() => setShowAuth(true)} onLogout={logout} />

      {page.name === 'home'      && <Home      {...shared} />}
      {page.name === 'explore'   && <Explore   {...shared} />}
      {page.name === 'lists'     && <Lists     {...shared} />}
      {page.name === 'clubs'     && <Clubs     {...shared} />}
      {page.name === 'dashboard' && user && <Dashboard {...shared} />}
      {page.name === 'book'      && page.data  && <BookDetail book={page.data} {...shared} />}
      {page.name === 'profile'   && page.data  && <Profile username={page.data} {...shared} />}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={login} />}
    </ThemeCtx.Provider>
  );
}
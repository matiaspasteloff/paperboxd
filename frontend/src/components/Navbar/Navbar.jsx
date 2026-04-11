import { useState, useEffect } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import NavBtn from './NavBtn';
import Avatar from './Avatar';
import SearchBar from './SearchBar';
import ThemeDropdown from './ThemeDropdown';
import MobileMenu from './MobileMenu';
import MobileBottomNav from './MobileBottomNav';

const NAV_LINKS = [
  { name: 'home',    label: 'Inicio'   },
  { name: 'explore', label: 'Explorar' },
  { name: 'lists',   label: 'Listas'   },
  { name: 'clubs',   label: 'Clubes'   },
];

export default function Navbar({ user, page, navigate, onAuthClick, onLogout }) {
  const [scrolled,    setScrolled]   = useState(false);
  const [themeOpen,   setThemeOpen]  = useState(false);
  const [mobileOpen,  setMobileOpen] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();
  const compact = isMobile || isTablet;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const go = (name, data = null) => { navigate(name, data); setMobileOpen(false); };

  return (
    <>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: scrolled || mobileOpen ? 'var(--surface)' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none', borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent', transition: 'all 0.3s', gap: '12px' }}>

        {/* Logo */}
        <div onClick={() => go('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 0 12px var(--accent-glow)' }}>📖</div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '17px', color: 'var(--text)', letterSpacing: '-0.3px' }}>
            Paper<span style={{ color: 'var(--accent)' }}>Boxd</span>
          </span>
        </div>

        {/* Desktop center links */}
        {!compact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {NAV_LINKS.map(({ name, label }) => (
              <NavBtn key={name} active={page.name === name} onClick={() => go(name)}>{label}</NavBtn>
            ))}
          </div>
        )}

        {/* Desktop search */}
        {!compact && <SearchBar onNavigate={go} />}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button onClick={() => { setThemeOpen(o => !o); setMobileOpen(false); }} style={{ background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '8px', padding: '6px 10px', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer' }}>🎨</button>

          {!compact && user && (
            <>
              <NavBtn active={page.name === 'dashboard'} onClick={() => go('dashboard')}>📚 Biblioteca</NavBtn>
              <button
                onClick={() => go('profile', user.username)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '10px', padding: '5px 12px', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
              >
                <Avatar name={user.username} color={user.avatar_color} size={22} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dim)' }}>@{user.username}</span>
              </button>
              <button className="btn-ghost" style={{ fontSize: '13px', padding: '7px 12px' }} onClick={onLogout}>Salir</button>
            </>
          )}

          {!compact && !user && (
            <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }} onClick={onAuthClick}>Ingresar</button>
          )}

          {compact && (
            <button onClick={() => setMobileOpen(o => !o)} style={{ background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '8px', padding: '7px 11px', color: 'var(--text)', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>
              {mobileOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </nav>

      {themeOpen && <ThemeDropdown onClose={() => setThemeOpen(false)} />}

      {compact && mobileOpen && (
        <MobileMenu page={page} user={user} navigate={navigate} onAuthClick={onAuthClick} onLogout={onLogout} onClose={() => setMobileOpen(false)} />
      )}

      <MobileBottomNav page={page} user={user} navigate={navigate} onAuthClick={onAuthClick} />

      {mobileOpen  && <div onClick={() => setMobileOpen(false)}  style={{ position: 'fixed', inset: 0, zIndex: 98 }} />}
      {themeOpen   && <div onClick={() => setThemeOpen(false)}   style={{ position: 'fixed', inset: 0, zIndex: 299 }} />}
    </>
  );
}

export { Avatar };
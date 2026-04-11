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
  const [scrolled,   setScrolled]  = useState(false);
  const [themeOpen,  setThemeOpen] = useState(false);
  const [mobileOpen, setMobileOpen]= useState(false);
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
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 100, height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: scrolled || mobileOpen ? 'var(--surface)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-2)' : '1px solid transparent',
        transition: 'all 0.3s',
        gap: '16px',
      }}>

        {/* Logo */}
        <div
          onClick={() => go('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}
        >
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700, fontSize: '18px', color: 'var(--text)',
            letterSpacing: '-0.3px',
          }}>Paper</span>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700, fontStyle: 'italic', fontSize: '18px',
            color: 'var(--accent)',
          }}>Boxd</span>
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
          <button
            onClick={() => { setThemeOpen(o => !o); setMobileOpen(false); }}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-2)',
              borderRadius: '4px',
              padding: '5px 9px',
              color: 'var(--text-muted)',
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: "'Lato', sans-serif",
              letterSpacing: '0.5px',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-3)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            title="Cambiar tema"
          >
            Tema
          </button>

          {!compact && user && (
            <>
              <NavBtn active={page.name === 'dashboard'} onClick={() => go('dashboard')}>
                Biblioteca
              </NavBtn>
              <button
                onClick={() => go('profile', user.username)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border-2)',
                  borderRadius: '4px',
                  padding: '5px 11px 5px 7px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-3)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
              >
                <Avatar name={user.username} color={user.avatar_color} size={22} />
                <span style={{
                  fontSize: '13px', fontWeight: '700',
                  color: 'var(--text-dim)',
                  fontFamily: "'Lato', sans-serif",
                }}>
                  {user.username}
                </span>
              </button>
              <button
                className="btn-ghost"
                style={{ fontSize: '12px', padding: '6px 12px', letterSpacing: '0.4px' }}
                onClick={onLogout}
              >
                Salir
              </button>
            </>
          )}

          {!compact && !user && (
            <button
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '12px' }}
              onClick={onAuthClick}
            >
              Ingresar
            </button>
          )}

          {compact && (
            <button
              onClick={() => setMobileOpen(o => !o)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-2)',
                borderRadius: '4px',
                padding: '7px 10px',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </nav>

      {themeOpen && <ThemeDropdown onClose={() => setThemeOpen(false)} />}

      {compact && mobileOpen && (
        <MobileMenu
          page={page} user={user} navigate={navigate}
          onAuthClick={onAuthClick} onLogout={onLogout}
          onClose={() => setMobileOpen(false)}
        />
      )}

      <MobileBottomNav page={page} user={user} navigate={navigate} onAuthClick={onAuthClick} />

      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 98 }} />}
      {themeOpen  && <div onClick={() => setThemeOpen(false)}  style={{ position: 'fixed', inset: 0, zIndex: 299 }} />}
    </>
  );
}

export { Avatar };
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../App';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { api } from '../api';

const THEMES = [
  { id: 'dark-blue', label: '🌊 Azul Oscuro' },
  { id: 'dark-pure', label: '⚡ Negro Puro' },
  { id: 'sepia',     label: '📜 Sepia' },
  { id: 'light',     label: '☀️ Claro' },
];

const NAV_LINKS = [
  { name: 'home',      label: 'Inicio',        icon: '🏠' },
  { name: 'explore',   label: 'Explorar',      icon: '🔭' },
  { name: 'lists',     label: 'Listas',        icon: '📋' },
  { name: 'clubs',     label: 'Clubes',        icon: '💬' },
  { name: 'dashboard', label: 'Mi biblioteca', icon: '📚' },
];

export default function Navbar({ user, page, navigate, onAuthClick, onLogout }) {
  const [scrolled,    setScrolled]   = useState(false);
  const [themeOpen,   setThemeOpen]  = useState(false);
  const [mobileOpen,  setMobileOpen] = useState(false);
  const [searchQ,     setSearchQ]    = useState('');
  const [searchRes,   setSearchRes]  = useState([]);
  const [searchOpen,  setSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isMobile, isTablet } = useBreakpoint();
  const compact  = isMobile || isTablet;
  const searchRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (!searchQ.trim()) { setSearchRes([]); return; }
    const t = setTimeout(async () => {
      try {
        const data = await api.searchUsers(searchQ);
        setSearchRes(data);
      } catch { setSearchRes([]); }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQ]);

  const go = (name, data = null) => { navigate(name, data); setMobileOpen(false); setSearchOpen(false); setSearchQ(''); };

  const goProfile = (username) => { go('profile', username); };

  return (
    <>
      {/* ── TOP BAR ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: scrolled || mobileOpen ? 'var(--surface)' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none', borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent', transition: 'all 0.3s', gap: '12px' }}>

        {/* Logo */}
        <div onClick={() => go('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 0 12px var(--accent-glow)' }}>📖</div>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '17px', color: 'var(--text)', letterSpacing: '-0.3px' }}>Paper<span style={{ color: 'var(--accent)' }}>Boxd</span></span>
        </div>

        {/* Desktop center links */}
        {!compact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {NAV_LINKS.filter(l => l.name !== 'dashboard').map(({ name, label }) => (
              <NavBtn key={name} active={page.name === name} onClick={() => go(name)}>{label}</NavBtn>
            ))}
          </div>
        )}

        {/* Search bar — desktop */}
        {!compact && (
          <div style={{ position: 'relative', flex: 1, maxWidth: '240px' }} ref={searchRef}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.2s' }}
              onFocus={() => setSearchOpen(true)}
            >
              <span style={{ padding: '0 10px', color: 'var(--text-muted)', fontSize: '14px', flexShrink: 0 }}>🔍</span>
              <input
                value={searchQ}
                onChange={e => { setSearchQ(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Buscar usuarios..."
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '13px', padding: '8px 10px 8px 0', outline: 'none', fontFamily: "'Figtree',sans-serif" }}
              />
            </div>
            {searchOpen && searchRes.length > 0 && (
              <div className="scaleIn" style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 200 }}>
                {searchRes.slice(0, 6).map(u => (
                  <div key={u.id} onClick={() => goProfile(u.username)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-sub)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Avatar name={u.username} color={u.avatar_color} size={28} />
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text)' }}>@{u.username}</p>
                      {u.bio && <p style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{u.bio}</p>}
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>{u.reviews_count} reseñas</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Theme */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setThemeOpen(o => !o); setMobileOpen(false); }} style={{ background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '8px', padding: '6px 10px', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer' }}>🎨</button>
            {themeOpen && (
              <div className="scaleIn" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '12px', padding: '6px', minWidth: '170px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 200 }}>
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => { setTheme(t.id); setThemeOpen(false); }} style={{ width: '100%', padding: '8px 12px', background: theme === t.id ? 'var(--accent-sub)' : 'transparent', border: theme === t.id ? '1px solid var(--border-2)' : '1px solid transparent', borderRadius: '8px', color: theme === t.id ? 'var(--accent-2)' : 'var(--text-dim)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontFamily: "'Figtree',sans-serif", fontWeight: theme === t.id ? '600' : '400', marginBottom: '2px' }}>{t.label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop auth */}
          {!compact && (
            user ? (
              <>
                <NavBtn active={page.name === 'dashboard'} onClick={() => go('dashboard')}>📚 Biblioteca</NavBtn>
                {/* Avatar → own profile */}
                <button onClick={() => goProfile(user.username)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '10px', padding: '5px 12px', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-3)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
                >
                  <Avatar name={user.username} color={user.avatar_color} size={22} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dim)' }}>@{user.username}</span>
                </button>
                <button className="btn-ghost" style={{ fontSize: '13px', padding: '7px 12px' }} onClick={onLogout}>Salir</button>
              </>
            ) : (
              <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }} onClick={onAuthClick}>Ingresar</button>
            )
          )}

          {/* Mobile hamburger */}
          {compact && (
            <button onClick={() => setMobileOpen(o => !o)} style={{ background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '8px', padding: '7px 11px', color: 'var(--text)', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>
              {mobileOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </nav>

      {/* ── MOBILE DROPDOWN ── */}
      {compact && mobileOpen && (
        <div className="fadeIn" style={{ position: 'fixed', top: '58px', left: 0, right: 0, zIndex: 99, background: 'var(--surface)', borderBottom: '1px solid var(--border-2)', padding: '12px 16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {/* Mobile search */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar usuarios..." style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '16px', padding: '10px 14px', outline: 'none', fontFamily: "'Figtree',sans-serif" }} />
            {searchRes.length > 0 && (
              <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '10px', overflow: 'hidden', marginTop: '6px' }}>
                {searchRes.slice(0, 5).map(u => (
                  <div key={u.id} onClick={() => goProfile(u.username)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                    <Avatar name={u.username} color={u.avatar_color} size={28} />
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '13px' }}>@{u.username}</p>
                      {u.bio && <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.bio.slice(0, 40)}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
            {NAV_LINKS.filter(l => l.name !== 'dashboard' || user).map(({ name, label, icon }) => (
              <button key={name} onClick={() => go(name)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '10px', background: page.name === name ? 'var(--accent-sub)' : 'transparent', color: page.name === name ? 'var(--accent-2)' : 'var(--text-dim)', border: page.name === name ? '1px solid var(--border-2)' : '1px solid transparent', fontSize: '15px', fontWeight: page.name === name ? '600' : '400', cursor: 'pointer', textAlign: 'left', fontFamily: "'Figtree',sans-serif" }}>
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{icon}</span>{label}
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => goProfile(user.username)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>
                  <Avatar name={user.username} color={user.avatar_color} size={28} />
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>@{user.username}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ver mi perfil</p>
                  </div>
                </button>
                <button onClick={() => { onLogout(); setMobileOpen(false); }} style={{ padding: '11px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '10px', color: 'var(--danger)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>Cerrar sesión</button>
              </div>
            ) : (
              <button onClick={() => { onAuthClick(); setMobileOpen(false); }} className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: '15px' }}>Ingresar / Registrarse</button>
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="mobile-nav">
        {NAV_LINKS.filter(l => l.name !== 'dashboard' || user).map(({ name, icon }) => {
          const lbl = { home: 'Inicio', explore: 'Explorar', lists: 'Listas', clubs: 'Clubes', dashboard: 'Yo' }[name];
          return (
            <button key={name} onClick={() => go(name)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 2px', background: 'transparent', border: 'none', cursor: 'pointer', color: page.name === name ? 'var(--accent-2)' : 'var(--text-muted)', transition: 'color 0.15s' }}>
              <span style={{ fontSize: '19px', lineHeight: 1 }}>{icon}</span>
              <span style={{ fontSize: '10px', fontWeight: page.name === name ? '700' : '400', fontFamily: "'Figtree',sans-serif" }}>{lbl}</span>
              {page.name === name && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', marginTop: '1px' }} />}
            </button>
          );
        })}
        {!user && (
          <button onClick={onAuthClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 2px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}>
            <span style={{ fontSize: '19px', lineHeight: 1 }}>👤</span>
            <span style={{ fontSize: '10px', fontWeight: '600', fontFamily: "'Figtree',sans-serif" }}>Entrar</span>
          </button>
        )}
      </div>

      {/* Close overlays */}
      {(themeOpen || mobileOpen || searchOpen) && (
        <div onClick={() => { setThemeOpen(false); setMobileOpen(false); setSearchOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: compact ? 98 : 199 }} />
      )}
    </>
  );
}

export function Avatar({ name, color = '#388bfd', size = 36 }) {
  const colors = ['#388bfd', '#cc88ff', '#55cc88', '#ff8855', '#ffcc44', '#ff5577', '#44cccc'];
  const bg     = color || colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: `${size * 0.42}px`, fontWeight: '700', color: '#fff', fontFamily: "'Syne',sans-serif", flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)' }}>
      {name[0].toUpperCase()}
    </div>
  );
}

function NavBtn({ active, onClick, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: active || hov ? 'var(--accent-sub)' : 'transparent', color: active ? 'var(--accent-2)' : hov ? 'var(--text)' : 'var(--text-dim)', border: active ? '1px solid var(--border-2)' : '1px solid transparent', fontSize: '14px', fontWeight: active ? '600' : '400', padding: '6px 13px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Figtree',sans-serif" }}>
      {children}
    </button>
  );
}
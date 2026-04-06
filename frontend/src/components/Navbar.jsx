import { useState, useEffect } from 'react';
import { useTheme } from '../App';
import { useBreakpoint } from '../hooks/useBreakpoint';

const THEMES = [
    { id: 'dark-blue', label: '🌊 Azul Oscuro' },
    { id: 'dark-pure', label: '⚡ Negro Puro' },
    { id: 'sepia', label: '📜 Sepia' },
    { id: 'light', label: '☀️ Claro' },
];

const NAV_LINKS = [
    { name: 'home', label: 'Inicio', icon: '🏠' },
    { name: 'explore', label: 'Explorar', icon: '🔭' },
    { name: 'lists', label: 'Listas', icon: '📋' },
    { name: 'clubs', label: 'Clubes', icon: '💬' },
    { name: 'dashboard', label: 'Mi biblioteca', icon: '📚' },
];

export default function Navbar({ user, page, navigate, onAuthClick, onLogout }) {
    const [scrolled, setScrolled] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const { isMobile, isTablet } = useBreakpoint();
    const compact = isMobile || isTablet;

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const go = (name) => { navigate(name); setMobileOpen(false); };

    return (
        <>
            {/* ── TOP BAR ── */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                height: '58px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 16px',
                background: scrolled || mobileOpen ? 'var(--surface)' : 'transparent',
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
                transition: 'all 0.3s',
            }}>
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
                        {NAV_LINKS.filter(l => l.name !== 'dashboard').map(({ name, label }) => (
                            <NavBtn key={name} active={page.name === name} onClick={() => go(name)}>{label}</NavBtn>
                        ))}
                    </div>
                )}

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Theme switcher */}
                    <div style={{ position: 'relative', zIndex: 201 }}>
                        <button onClick={() => { setThemeOpen(o => !o); setMobileOpen(false); }} style={{ background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '8px', padding: '6px 10px', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>
                            🎨
                        </button>
                        {themeOpen && (
                            <div className="scaleIn" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '12px', padding: '6px', minWidth: '170px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 201 }}>
                                {THEMES.map(t => (
                                    <button key={t.id} onClick={() => { setTheme(t.id); setThemeOpen(false); }} style={{ width: '100%', padding: '8px 12px', background: theme === t.id ? 'var(--accent-sub)' : 'transparent', border: theme === t.id ? '1px solid var(--border-2)' : '1px solid transparent', borderRadius: '8px', color: theme === t.id ? 'var(--accent-2)' : 'var(--text-dim)', fontSize: '13px', cursor: 'pointer', textAlign: 'left', fontFamily: "'Figtree',sans-serif", fontWeight: theme === t.id ? '600' : '400', marginBottom: '2px' }}>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop auth */}
                    {!compact && (
                        user ? (
                            <>
                                <NavBtn active={page.name === 'dashboard'} onClick={() => go('dashboard')}>📚 Mi biblioteca</NavBtn>
                                <button className="btn-ghost" style={{ fontSize: '13px', padding: '7px 14px' }} onClick={onLogout}>Salir</button>
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

            {/* ── MOBILE DROPDOWN MENU ── */}
            {compact && mobileOpen && (
                <div className="fadeIn" style={{ position: 'fixed', top: '58px', left: 0, right: 0, zIndex: 99, background: 'var(--surface)', borderBottom: '1px solid var(--border-2)', padding: '12px 16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
                        {NAV_LINKS.filter(l => l.name !== 'dashboard' || user).map(({ name, label, icon }) => (
                            <button key={name} onClick={() => go(name)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', background: page.name === name ? 'var(--accent-sub)' : 'transparent', color: page.name === name ? 'var(--accent-2)' : 'var(--text-dim)', border: page.name === name ? '1px solid var(--border-2)' : '1px solid transparent', fontSize: '15px', fontWeight: page.name === name ? '600' : '400', cursor: 'pointer', textAlign: 'left', fontFamily: "'Figtree',sans-serif" }}>
                                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{icon}</span>
                                {label}
                            </button>
                        ))}
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                        {user ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '4px' }}>Sesión de <strong style={{ color: 'var(--accent-2)' }}>{user.username}</strong></p>
                                <button onClick={() => { onLogout(); setMobileOpen(false); }} style={{ padding: '11px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '10px', color: 'var(--danger)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>
                                    Cerrar sesión
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => { onAuthClick(); setMobileOpen(false); }} className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: '15px' }}>
                                Ingresar / Registrarse
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── MOBILE BOTTOM NAV ── */}
            <div className="mobile-nav">
                {NAV_LINKS.filter(l => l.name !== 'dashboard' || user).map(({ name, icon }) => {
                    const shortLabel = { home: 'Inicio', explore: 'Explorar', lists: 'Listas', clubs: 'Clubes', dashboard: 'Yo' }[name];
                    return (
                        <button key={name} onClick={() => go(name)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 2px', background: 'transparent', border: 'none', cursor: 'pointer', color: page.name === name ? 'var(--accent-2)' : 'var(--text-muted)', transition: 'color 0.15s' }}>
                            <span style={{ fontSize: '19px', lineHeight: 1 }}>{icon}</span>
                            <span style={{ fontSize: '10px', fontWeight: page.name === name ? '700' : '400', fontFamily: "'Figtree',sans-serif" }}>{shortLabel}</span>
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
            {(themeOpen || mobileOpen) && (
                <div onClick={() => { setThemeOpen(false); setMobileOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: compact ? 98 : 150 }} />
            )}
        </>
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
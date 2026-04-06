import { useState, useEffect } from 'react';
import { useTheme } from '../App';

const THEMES = [
    { id: 'dark-blue', label: '🌊 Azul Oscuro' },
    { id: 'dark-pure', label: '⚡ Negro Puro' },
    { id: 'sepia', label: '📜 Sepia' },
    { id: 'light', label: '☀️ Claro' },
];

export default function Navbar({ user, page, navigate, onAuthClick, onLogout }) {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '58px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px',
            background: scrolled ? 'rgba(3,11,22,0.9)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
            transition: 'all 0.3s',
        }}>
            {/* Logo */}
            <div onClick={() => navigate('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                    width: '28px', height: '28px', borderRadius: '7px',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', boxShadow: '0 0 12px var(--accent-glow)',
                }}>📖</div>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: '17px', color: 'var(--text)', letterSpacing: '-0.3px' }}>
                    Paper<span style={{ color: 'var(--accent)' }}>Boxd</span>
                </span>
            </div>

            {/* Center nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {[
                    { name: 'home', label: 'Inicio' },
                    { name: 'explore', label: 'Explorar' },
                    { name: 'lists', label: 'Listas' },
                    { name: 'clubs', label: 'Clubes' },
                ].map(({ name, label }) => (
                    <NavBtn key={name} active={page.name === name} onClick={() => navigate(name)}>{label}</NavBtn>
                ))}
            </div>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                {/* Theme switcher */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setMenuOpen(m => !m)}
                        style={{
                            background: 'var(--accent-sub)', border: '1px solid var(--border-2)',
                            borderRadius: '8px', padding: '6px 10px', color: 'var(--text-dim)',
                            fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                            fontFamily: "'Figtree',sans-serif",
                        }}
                    >
                        🎨
                    </button>
                    {menuOpen && (
                        <div
                            className="scaleIn"
                            style={{
                                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                background: 'var(--surface-2)', border: '1px solid var(--border-2)',
                                borderRadius: '12px', padding: '6px', minWidth: '170px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 200,
                            }}
                        >
                            {THEMES.map(t => (
                                <button key={t.id} onClick={() => { setTheme(t.id); setMenuOpen(false); }} style={{
                                    width: '100%', padding: '8px 12px', background: theme === t.id ? 'var(--accent-sub)' : 'transparent',
                                    border: theme === t.id ? '1px solid var(--border-2)' : '1px solid transparent',
                                    borderRadius: '8px', color: theme === t.id ? 'var(--accent-2)' : 'var(--text-dim)',
                                    fontSize: '13px', cursor: 'pointer', textAlign: 'left',
                                    fontFamily: "'Figtree',sans-serif", fontWeight: theme === t.id ? '600' : '400',
                                    transition: 'all 0.15s', marginBottom: '2px',
                                }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {user ? (
                    <>
                        <NavBtn active={page.name === 'dashboard'} onClick={() => navigate('dashboard')}>
                            📚 Mi biblioteca
                        </NavBtn>
                        <button className="btn-ghost" style={{ fontSize: '13px', padding: '7px 14px' }} onClick={onLogout}>Salir</button>
                    </>
                ) : (
                    <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }} onClick={onAuthClick}>
                        Ingresar
                    </button>
                )}
            </div>

            {/* Close theme menu on outside click */}
            {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />}
        </nav>
    );
}

function NavBtn({ active, onClick, children }) {
    const [hov, setHov] = useState(false);
    return (
        <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            background: active ? 'var(--accent-sub)' : hov ? 'var(--accent-sub)' : 'transparent',
            color: active ? 'var(--accent-2)' : hov ? 'var(--text)' : 'var(--text-dim)',
            border: active ? '1px solid var(--border-2)' : '1px solid transparent',
            fontSize: '14px', fontWeight: active ? '600' : '400',
            padding: '6px 13px', borderRadius: '8px', cursor: 'pointer',
            transition: 'all 0.15s', fontFamily: "'Figtree',sans-serif",
        }}>
            {children}
        </button>
    );
}
import { useState, useEffect } from 'react';

export default function Navbar({ user, page, navigate, onAuthClick, onLogout }) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const isActive = (name) => page.name === name;

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            height: '58px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 28px',
            background: scrolled ? 'rgba(3,11,22,0.88)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(56,139,253,0.1)' : '1px solid transparent',
            transition: 'background 0.3s, border-color 0.3s',
        }}>

            {/* Logo */}
            <div
                onClick={() => navigate('home')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <div style={{
                    width: '28px', height: '28px', borderRadius: '7px',
                    background: 'linear-gradient(135deg, #388bfd, #1a5fb8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', boxShadow: '0 0 12px rgba(56,139,253,0.4)',
                }}>📖</div>
                <span style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 800,
                    fontSize: '17px', color: '#ddeeff', letterSpacing: '-0.3px',
                }}>
                    Paper<span style={{ color: '#388bfd' }}>Boxd</span>
                </span>
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {user ? (
                    <>
                        <NavLink active={isActive('home')} onClick={() => navigate('home')}>Explorar</NavLink>
                        <NavLink active={isActive('dashboard')} onClick={() => navigate('dashboard')}>Mi biblioteca</NavLink>
                        <div style={{ width: '1px', height: '18px', background: 'rgba(56,139,253,0.15)', margin: '0 6px' }} />
                        <span style={{ fontSize: '13px', color: '#3d6080', marginRight: '4px' }}>
                            {user.username}
                        </span>
                        <button
                            className="btn-ghost"
                            style={{ fontSize: '13px', padding: '7px 14px' }}
                            onClick={onLogout}
                        >
                            Salir
                        </button>
                    </>
                ) : (
                    <>
                        <NavLink active={isActive('home')} onClick={() => navigate('home')}>Inicio</NavLink>
                        <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }} onClick={onAuthClick}>
                            Ingresar
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

function NavLink({ active, onClick, children }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: active ? 'rgba(56,139,253,0.1)' : hov ? 'rgba(56,139,253,0.06)' : 'transparent',
                color: active ? '#58a6ff' : hov ? '#ddeeff' : '#7fafd4',
                border: active ? '1px solid rgba(56,139,253,0.2)' : '1px solid transparent',
                fontSize: '14px', fontWeight: active ? '600' : '400',
                padding: '6px 14px', borderRadius: '8px',
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: "'Figtree', sans-serif",
            }}
        >
            {children}
        </button>
    );
}
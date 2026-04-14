import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useBreakpoint } from '../hooks/useBreakpoint';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function useGoogleScript() {
    const [ready, setReady] = useState(typeof window !== 'undefined' && !!window.google);
    useEffect(() => {
        if (window.google) { setReady(true); return; }
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => setReady(true);
        document.head.appendChild(script);
    }, []);
    return ready;
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}

const labelStyle = {
    display: 'block',
    fontSize: '11px', fontWeight: '700',
    color: 'var(--text-dim)', marginBottom: '7px',
    letterSpacing: '0.7px', textTransform: 'uppercase',
    fontFamily: "'Lato', sans-serif",
};

function Field({ label, children }) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            {children}
        </div>
    );
}

export default function AuthModal({ onClose, onSuccess }) {
    const { isMobile } = useBreakpoint();
    const googleReady = useGoogleScript();
    const googleBtnRef = useRef(null);
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [gLoading, setGLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    // Mount Google button
    useEffect(() => {
        if (!googleReady || !googleBtnRef.current || !GOOGLE_CLIENT_ID) return;
        try {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
            });
            window.google.accounts.id.renderButton(googleBtnRef.current, {
                theme: 'outline',
                size: 'large',
                width: Math.min(googleBtnRef.current.offsetWidth || 320, 360),
                text: mode === 'login' ? 'signin_with' : 'signup_with',
                locale: 'es',
            });
        } catch (e) {
            console.error('Google init error:', e);
        }
    }, [googleReady, mode]);

    const handleGoogleResponse = async (response) => {
        setError('');
        setGLoading(true);
        try {
            const data = await api.googleLogin(response.credential);
            onSuccess(data.access_token, data.username);
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión con Google');
        } finally {
            setGLoading(false);
        }
    };

    const submit = async () => {
        setError('');
        if (!form.email || !form.password) { setError('Completá todos los campos'); return; }
        if (mode === 'register' && !form.username) { setError('Username requerido'); return; }
        if (mode === 'register' && form.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres'); return;
        }
        setLoading(true);
        try {
            if (mode === 'register') {
                await api.register(form);
            }
            const data = await api.login(form.email, form.password);
            onSuccess(data.access_token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fadeIn"
            onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: isMobile ? 'flex-end' : 'center',
                justifyContent: 'center',
            }}
        >
            <div
                className="scaleIn"
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border-2)',
                    borderRadius: isMobile ? '20px 20px 0 0' : '16px',
                    padding: isMobile ? '28px 20px 32px' : '40px',
                    width: '100%',
                    maxWidth: isMobile ? '100%' : '400px',
                    margin: isMobile ? '0' : '16px',
                    boxShadow: '0 0 60px var(--accent-glow), 0 24px 80px rgba(0,0,0,0.5)',
                    position: 'relative',
                }}
            >
                {isMobile && (
                    <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--border-2)', margin: '0 auto 20px' }} />
                )}
                <button onClick={onClose} style={{ position: 'absolute', top: isMobile ? '16px' : '14px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>×</button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', margin: '0 auto 16px', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8">
                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" strokeLinejoin="round" />
                            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '20px', marginBottom: '5px' }}>
                        {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>PaperBoxd · Tu diario de lectura</p>
                </div>

                {/* Mode tabs */}
                <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: '10px', padding: '3px', marginBottom: '20px', gap: '3px' }}>
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => { setMode(m); setError(''); }} style={{ flex: 1, padding: '9px', background: mode === m ? 'var(--accent)' : 'transparent', color: mode === m ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Lato', sans-serif", transition: 'all 0.18s' }}>
                            {m === 'login' ? 'Ingresar' : 'Registrarse'}
                        </button>
                    ))}
                </div>

                {/* Google OAuth button */}
                <div style={{ marginBottom: '16px' }}>
                    {gLoading ? (
                        <div style={{ height: '44px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px', gap: '10px' }}>
                            <span style={{ width: '16px', height: '16px', border: '2px solid var(--border-2)', borderTop: '2px solid var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.75s linear infinite' }} />
                            Conectando...
                        </div>
                    ) : GOOGLE_CLIENT_ID ? (
                        <div ref={googleBtnRef} style={{ width: '100%', minHeight: '44px', display: 'flex', justifyContent: 'center' }} />
                    ) : (
                        /* Placeholder shown when VITE_GOOGLE_CLIENT_ID is not set */
                        <div style={{ padding: '11px 16px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <GoogleIcon />
                            <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontFamily: "'Lato', sans-serif" }}>
                                Google OAuth (configurar VITE_GOOGLE_CLIENT_ID)
                            </span>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-2)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>o con email</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-2)' }} />
                </div>

                {/* Error */}
                {error && (
                    <div style={{ background: 'rgba(192,82,74,0.10)', border: '1px solid rgba(192,82,74,0.28)', borderRadius: '8px', padding: '10px 14px', color: 'var(--danger)', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
                        {error}
                    </div>
                )}

                {/* Email/password form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {mode === 'register' && (
                        <Field label="Usuario">
                            <input className="input-field" placeholder="tu_usuario" value={form.username} onChange={set('username')} onKeyDown={e => e.key === 'Enter' && submit()} autoComplete="username" />
                        </Field>
                    )}
                    <Field label="Email">
                        <input className="input-field" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={set('email')} onKeyDown={e => e.key === 'Enter' && submit()} autoComplete="email" />
                    </Field>
                    <Field label="Contraseña">
                        <input className="input-field" type="password" placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'} value={form.password} onChange={set('password')} onKeyDown={e => e.key === 'Enter' && submit()} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
                    </Field>

                    <button onClick={submit} disabled={loading} style={{ width: '100%', marginTop: '4px', background: loading ? 'var(--surface-3)' : 'var(--accent)', color: loading ? 'var(--text-muted)' : '#fff', fontWeight: '700', fontSize: '15px', padding: '13px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Lato', sans-serif", letterSpacing: '0.4px', transition: 'all 0.18s' }}>
                        {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
                    </button>
                </div>
            </div>
        </div>
    );
}
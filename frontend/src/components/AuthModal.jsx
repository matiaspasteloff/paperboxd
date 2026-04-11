import { useState } from 'react';
import { api } from '../api';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function AuthModal({ onClose, onSuccess }) {
    const { isMobile } = useBreakpoint();
    const [mode, setMode] = useState('login');
    // steps: 'form' | 'verify'
    const [step, setStep] = useState('form');
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [pendingEmail, setPendingEmail] = useState('');

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const submit = async () => {
        setError(''); setInfo('');
        if (!form.email || !form.password) { setError('Completá todos los campos'); return; }
        if (mode === 'register' && !form.username) { setError('Username requerido'); return; }
        if (mode === 'register' && form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return; }
        setLoading(true);
        try {
            if (mode === 'register') {
                // Register and then send verification code
                await api.register(form);
                await api.sendVerificationCode(form.email);
                setPendingEmail(form.email);
                setStep('verify');
                setInfo(`Enviamos un código de 6 dígitos a ${form.email}`);
            } else {
                const data = await api.login(form.email, form.password);
                onSuccess(data.access_token);
            }
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const verify = async () => {
        setError(''); setInfo('');
        if (code.length !== 6) { setError('El código debe tener 6 dígitos'); return; }
        setLoading(true);
        try {
            await api.verifyEmail(pendingEmail, code);
            // Auto-login after verification
            const data = await api.login(form.email, form.password);
            onSuccess(data.access_token);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const resendCode = async () => {
        setError(''); setInfo('');
        setLoading(true);
        try {
            await api.sendVerificationCode(pendingEmail);
            setInfo('Código reenviado. Revisá tu casilla.');
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
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
                    <div style={{
                        width: '40px', height: '4px', borderRadius: '2px',
                        background: 'var(--border-2)', margin: '0 auto 20px',
                    }} />
                )}

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: isMobile ? '16px' : '14px', right: '16px',
                        background: 'transparent', border: 'none',
                        color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer', lineHeight: 1,
                    }}
                >×</button>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        margin: '0 auto 16px',
                        background: 'var(--accent-sub)',
                        border: '1px solid var(--border-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8">
                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" strokeLinejoin="round" />
                            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {step === 'verify' ? (
                        <>
                            <h2 style={{ fontSize: '20px', marginBottom: '6px' }}>Verificar email</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                                {info || `Código enviado a ${pendingEmail}`}
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 style={{ fontSize: '20px', marginBottom: '5px' }}>
                                {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>PaperBoxd · Tu diario de lectura</p>
                        </>
                    )}
                </div>

                {/* Mode tabs — only on form step */}
                {step === 'form' && (
                    <div style={{
                        display: 'flex', background: 'var(--surface-2)',
                        borderRadius: '10px', padding: '3px', marginBottom: '22px', gap: '3px',
                    }}>
                        {['login', 'register'].map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(''); }}
                                style={{
                                    flex: 1, padding: '9px',
                                    background: mode === m ? 'var(--accent)' : 'transparent',
                                    color: mode === m ? '#fff' : 'var(--text-muted)',
                                    border: 'none', borderRadius: '8px',
                                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                                    fontFamily: "'Lato', sans-serif",
                                    transition: 'all 0.18s',
                                }}
                            >
                                {m === 'login' ? 'Ingresar' : 'Registrarse'}
                            </button>
                        ))}
                    </div>
                )}

                {/* Error / info */}
                {error && (
                    <div style={{
                        background: 'rgba(192,82,74,0.10)', border: '1px solid rgba(192,82,74,0.28)',
                        borderRadius: '8px', padding: '10px 14px', color: 'var(--danger)',
                        fontSize: '13px', marginBottom: '16px', lineHeight: 1.5,
                    }}>{error}</div>
                )}
                {info && !error && (
                    <div style={{
                        background: 'rgba(90,158,106,0.10)', border: '1px solid rgba(90,158,106,0.28)',
                        borderRadius: '8px', padding: '10px 14px', color: 'var(--success)',
                        fontSize: '13px', marginBottom: '16px', lineHeight: 1.5,
                    }}>{info}</div>
                )}

                {/* ── FORM STEP ── */}
                {step === 'form' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {mode === 'register' && (
                            <Field label="Usuario">
                                <input
                                    className="input-field"
                                    placeholder="tu_usuario"
                                    value={form.username}
                                    onChange={set('username')}
                                    onKeyDown={e => e.key === 'Enter' && submit()}
                                    autoComplete="username"
                                />
                            </Field>
                        )}
                        <Field label="Email">
                            <input
                                className="input-field"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={form.email}
                                onChange={set('email')}
                                onKeyDown={e => e.key === 'Enter' && submit()}
                                autoComplete="email"
                            />
                        </Field>
                        <Field label="Contraseña">
                            <input
                                className="input-field"
                                type="password"
                                placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
                                value={form.password}
                                onChange={set('password')}
                                onKeyDown={e => e.key === 'Enter' && submit()}
                                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                            />
                        </Field>

                        <button
                            onClick={submit}
                            disabled={loading}
                            style={{
                                width: '100%', marginTop: '6px',
                                background: loading ? 'var(--surface-3)' : 'var(--accent)',
                                color: loading ? 'var(--text-muted)' : '#fff',
                                fontWeight: '700', fontSize: '15px', padding: '14px',
                                borderRadius: '10px', border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontFamily: "'Lato', sans-serif",
                                letterSpacing: '0.4px',
                                transition: 'all 0.18s',
                            }}
                        >
                            {loading ? 'Cargando...' : mode === 'login' ? 'Ingresar' : 'Continuar'}
                        </button>
                    </div>
                )}

                {/* ── VERIFY STEP ── */}
                {step === 'verify' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Código de verificación</label>
                            <input
                                className="input-field"
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="000000"
                                value={code}
                                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                onKeyDown={e => e.key === 'Enter' && verify()}
                                style={{
                                    textAlign: 'center',
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    letterSpacing: '8px',
                                    fontFamily: "'Lato', monospace",
                                    padding: '16px',
                                }}
                                autoFocus
                            />
                            <p style={{
                                fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px',
                                textAlign: 'center', lineHeight: 1.6,
                            }}>
                                Revisá tu carpeta de spam si no lo encontrás.
                            </p>
                        </div>

                        <button
                            onClick={verify}
                            disabled={loading || code.length !== 6}
                            style={{
                                width: '100%',
                                background: (loading || code.length !== 6) ? 'var(--surface-3)' : 'var(--accent)',
                                color: (loading || code.length !== 6) ? 'var(--text-muted)' : '#fff',
                                fontWeight: '700', fontSize: '15px', padding: '14px',
                                borderRadius: '10px', border: 'none',
                                cursor: (loading || code.length !== 6) ? 'not-allowed' : 'pointer',
                                fontFamily: "'Lato', sans-serif",
                                transition: 'all 0.18s',
                            }}
                        >
                            {loading ? 'Verificando...' : 'Verificar y entrar'}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                onClick={resendCode}
                                disabled={loading}
                                style={{
                                    background: 'transparent', border: 'none',
                                    color: 'var(--accent)', fontSize: '13px',
                                    cursor: 'pointer', fontFamily: "'Lato', sans-serif",
                                    textDecoration: 'underline', padding: 0,
                                }}
                            >
                                Reenviar código
                            </button>
                            <span style={{ color: 'var(--border-2)' }}>·</span>
                            <button
                                onClick={() => { setStep('form'); setCode(''); setError(''); setInfo(''); }}
                                style={{
                                    background: 'transparent', border: 'none',
                                    color: 'var(--text-muted)', fontSize: '13px',
                                    cursor: 'pointer', fontFamily: "'Lato', sans-serif",
                                    padding: 0,
                                }}
                            >
                                Cambiar email
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
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
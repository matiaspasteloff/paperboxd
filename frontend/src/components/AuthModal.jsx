import { useState } from 'react';
import { api } from '../api';

export default function AuthModal({ onClose, onSuccess }) {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const submit = async () => {
        setError('');
        if (!form.email || !form.password) { setError('Completá todos los campos'); return; }
        if (mode === 'register' && !form.username) { setError('El nombre de usuario es requerido'); return; }
        setLoading(true);
        try {
            if (mode === 'register') {
                await api.register(form);
                setMode('login');
                setError('');
                return;
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
                background: 'rgba(3,11,22,0.82)',
                backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            <div
                className="scaleIn"
                style={{
                    background: 'linear-gradient(160deg, #06111f 0%, #091828 100%)',
                    border: '1px solid rgba(56,139,253,0.2)',
                    borderRadius: '20px',
                    padding: '40px',
                    width: '100%', maxWidth: '400px', margin: '16px',
                    boxShadow: '0 0 60px rgba(56,139,253,0.12), 0 24px 80px rgba(0,0,0,0.7)',
                    position: 'relative',
                }}
            >
                {/* Close */}
                <button onClick={onClose} style={{
                    position: 'absolute', top: '14px', right: '16px',
                    background: 'transparent', border: 'none',
                    color: '#3d6080', fontSize: '22px', cursor: 'pointer', lineHeight: 1,
                }}>×</button>

                {/* Header */}
                <div style={{ marginBottom: '28px', textAlign: 'center' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, #388bfd, #1a5fb8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', boxShadow: '0 0 20px rgba(56,139,253,0.35)',
                    }}>📖</div>
                    <h2 style={{ fontSize: '22px', marginBottom: '6px' }}>
                        {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
                    </h2>
                    <p style={{ color: '#3d6080', fontSize: '13px' }}>
                        {mode === 'login' ? 'Ingresá para ver tu biblioteca' : 'Registrate gratis en PaperBoxd'}
                    </p>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex', background: '#0d2038', borderRadius: '10px',
                    padding: '3px', marginBottom: '24px', gap: '3px',
                }}>
                    {['login', 'register'].map((m) => (
                        <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                            flex: 1, padding: '8px',
                            background: mode === m ? '#388bfd' : 'transparent',
                            color: mode === m ? '#fff' : '#3d6080',
                            border: 'none', borderRadius: '8px',
                            fontSize: '13px', fontWeight: '600',
                            cursor: 'pointer', transition: 'all 0.18s',
                            fontFamily: "'Figtree', sans-serif",
                            boxShadow: mode === m ? '0 0 12px rgba(56,139,253,0.3)' : 'none',
                        }}>
                            {m === 'login' ? 'Ingresar' : 'Registrarse'}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.25)',
                        borderRadius: '8px', padding: '10px 14px',
                        color: '#f85149', fontSize: '13px', marginBottom: '16px',
                    }}>{error}</div>
                )}

                {/* Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {mode === 'register' && (
                        <Field label="Usuario">
                            <input className="input-field" placeholder="tu_usuario_lector"
                                value={form.username} onChange={set('username')}
                                onKeyDown={(e) => e.key === 'Enter' && submit()} />
                        </Field>
                    )}
                    <Field label="Email">
                        <input className="input-field" type="email" placeholder="correo@ejemplo.com"
                            value={form.email} onChange={set('email')}
                            onKeyDown={(e) => e.key === 'Enter' && submit()} />
                    </Field>
                    <Field label="Contraseña">
                        <input className="input-field" type="password" placeholder="••••••••"
                            value={form.password} onChange={set('password')}
                            onKeyDown={(e) => e.key === 'Enter' && submit()} />
                    </Field>
                </div>

                <button
                    onClick={submit}
                    disabled={loading}
                    style={{
                        width: '100%', marginTop: '22px',
                        background: loading ? '#1a3f6f' : 'linear-gradient(135deg, #388bfd, #1a6bcc)',
                        color: '#fff', fontWeight: '700', fontSize: '15px',
                        padding: '13px', borderRadius: '10px', border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.18s', letterSpacing: '0.2px',
                        fontFamily: "'Figtree', sans-serif",
                        boxShadow: loading ? 'none' : '0 0 20px rgba(56,139,253,0.3)',
                    }}
                >
                    {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
                </button>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label style={{
                display: 'block', fontSize: '11px', fontWeight: '600',
                color: '#7fafd4', marginBottom: '6px',
                letterSpacing: '0.6px', textTransform: 'uppercase',
            }}>{label}</label>
            {children}
        </div>
    );
}
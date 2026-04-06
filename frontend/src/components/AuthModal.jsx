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
        if (mode === 'register' && !form.username) { setError('Username requerido'); return; }
        setLoading(true);
        try {
            if (mode === 'register') { await api.register(form); setMode('login'); setError(''); return; }
            const data = await api.login(form.email, form.password);
            onSuccess(data.access_token);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="fadeIn" onClick={(e) => e.target === e.currentTarget && onClose()} style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div className="scaleIn" style={{
                background: 'var(--surface)', border: '1px solid var(--border-2)',
                borderRadius: '20px', padding: '40px',
                width: '100%', maxWidth: '400px', margin: '16px',
                boxShadow: '0 0 60px var(--accent-glow), 0 24px 80px rgba(0,0,0,0.6)',
                position: 'relative',
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>×</button>

                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                        boxShadow: '0 0 20px var(--accent-glow)',
                    }}>📖</div>
                    <h2 style={{ fontSize: '22px', marginBottom: '6px' }}>{mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>PaperBoxd · Tu diario de lectura</p>
                </div>

                <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: '10px', padding: '3px', marginBottom: '24px', gap: '3px' }}>
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                            flex: 1, padding: '8px', background: mode === m ? 'var(--accent)' : 'transparent',
                            color: mode === m ? '#fff' : 'var(--text-muted)',
                            border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                            cursor: 'pointer', transition: 'all 0.18s', fontFamily: "'Figtree',sans-serif",
                            boxShadow: mode === m ? '0 0 12px var(--accent-glow)' : 'none',
                        }}>{m === 'login' ? 'Ingresar' : 'Registrarse'}</button>
                    ))}
                </div>

                {error && <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.25)', borderRadius: '8px', padding: '10px 14px', color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {mode === 'register' && <Field label="Usuario"><input className="input-field" placeholder="tu_usuario" value={form.username} onChange={set('username')} onKeyDown={(e) => e.key === 'Enter' && submit()} /></Field>}
                    <Field label="Email"><input className="input-field" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={set('email')} onKeyDown={(e) => e.key === 'Enter' && submit()} /></Field>
                    <Field label="Contraseña"><input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} onKeyDown={(e) => e.key === 'Enter' && submit()} /></Field>
                </div>

                <button onClick={submit} disabled={loading} style={{
                    width: '100%', marginTop: '22px',
                    background: loading ? 'var(--surface-3)' : 'var(--accent)',
                    color: loading ? 'var(--text-muted)' : '#fff',
                    fontWeight: '700', fontSize: '15px', padding: '13px', borderRadius: '10px', border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Figtree',sans-serif",
                    boxShadow: loading ? 'none' : '0 0 20px var(--accent-glow)', transition: 'all 0.18s',
                }}>
                    {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
                </button>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', marginBottom: '6px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>{label}</label>
            {children}
        </div>
    );
}
import { useState } from 'react';
import { api } from '../api';
import StarRating from './StarRating';

const MOODS = ['oscuro', 'emotivo', 'relajante', 'romántico', 'filosófico', 'épico', 'humorístico', 'misterioso'];
const PACES = ['lento', 'moderado', 'rápido'];
const GENRES = ['ficción', 'no ficción', 'fantasía', 'ciencia ficción', 'romance', 'thriller', 'historia', 'poesía', 'ensayo', 'terror', 'autoayuda', 'infantil'];

export default function ReviewModal({ book, token, onClose, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [selectedMoods, setMoods] = useState([]);
    const [pace, setPace] = useState('');
    const [genre, setGenre] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const workId = book.key?.replace('/works/', '') || '';
    const coverUrl = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null;

    const toggleMood = (m) => setMoods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

    const submit = async () => {
        if (!rating) { setError('Seleccioná al menos 1 estrella'); return; }
        setLoading(true); setError('');
        try {
            await api.createReview(token, {
                open_library_work_id: workId,
                rating, review_text: text.trim() || null,
                mood_tags: selectedMoods.join(','),
                pace_tag: pace, genre,
            });
            onSuccess();
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div className="fadeIn" onClick={(e) => e.target === e.currentTarget && onClose()} style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }}>
            <div className="scaleIn" style={{
                background: 'var(--surface)', border: '1px solid var(--border-2)',
                borderRadius: '20px', padding: '32px',
                width: '100%', maxWidth: '500px',
                maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
                position: 'relative',
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer' }}>×</button>

                {/* Book header */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '52px', height: '76px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        {coverUrl ? <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📖</span>}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', lineHeight: 1.3, marginBottom: '4px' }}>{book.title}</h3>
                        {book.author_name?.[0] && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{book.author_name[0]}</p>}
                    </div>
                </div>

                <Section label="Calificación">
                    <StarRating value={rating} onChange={setRating} size="xl" showLabel />
                </Section>

                <Section label="Reseña (opcional)">
                    <textarea value={text} onChange={e => setText(e.target.value)} placeholder="¿Qué te pareció?" style={{ width: '100%', minHeight: '88px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '14px', padding: '11px 14px', resize: 'vertical', fontFamily: "'Figtree',sans-serif", lineHeight: 1.65, outline: 'none', transition: 'border-color 0.18s' }} onFocus={e => (e.target.style.borderColor = 'var(--border-3)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
                </Section>

                <Section label="Estado de ánimo del libro">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {MOODS.map(m => (
                            <Tag key={m} active={selectedMoods.includes(m)} onClick={() => toggleMood(m)}>{m}</Tag>
                        ))}
                    </div>
                </Section>

                <Section label="Ritmo de lectura">
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {PACES.map(p => <Tag key={p} active={pace === p} onClick={() => setPace(pace === p ? '' : p)}>{p}</Tag>)}
                    </div>
                </Section>

                <Section label="Género">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {GENRES.map(g => <Tag key={g} active={genre === g} onClick={() => setGenre(genre === g ? '' : g)}>{g}</Tag>)}
                    </div>
                </Section>

                {error && <p style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button className="btn-ghost" onClick={onClose} style={{ padding: '12px 20px' }}>Cancelar</button>
                    <button onClick={submit} disabled={loading} style={{
                        flex: 1, padding: '12px', background: loading ? 'var(--surface-3)' : 'var(--accent)',
                        color: loading ? 'var(--text-muted)' : '#fff',
                        fontWeight: '700', fontSize: '15px', borderRadius: '10px', border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontFamily: "'Figtree',sans-serif",
                        boxShadow: loading ? 'none' : '0 0 16px var(--accent-glow)', transition: 'all 0.18s',
                    }}>
                        {loading ? 'Guardando...' : 'Guardar reseña'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Section({ label, children }) {
    return (
        <div style={{ marginBottom: '18px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '10px' }}>{label}</p>
            {children}
        </div>
    );
}

function Tag({ active, onClick, children }) {
    const [hov, setHov] = useState(false);
    return (
        <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            padding: '5px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: active ? '600' : '400',
            background: active ? 'var(--accent)' : hov ? 'var(--accent-sub)' : 'var(--surface-3)',
            color: active ? '#fff' : hov ? 'var(--accent-2)' : 'var(--text-muted)',
            border: `1px solid ${active ? 'var(--accent)' : hov ? 'var(--border-2)' : 'var(--border)'}`,
            cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Figtree',sans-serif",
        }}>{children}</button>
    );
}
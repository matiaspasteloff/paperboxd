import { useState } from 'react';
import { api } from '../api';
import StarRating from './StarRating';

export default function ReviewModal({ book, token, onClose, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const workId = book.key?.replace('/works/', '') || '';
    const coverUrl = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null;

    const submit = async () => {
        if (!rating) { setError('Seleccioná al menos 1 estrella'); return; }
        setLoading(true); setError('');
        try {
            await api.createReview(token, {
                open_library_work_id: workId,
                rating,
                review_text: text.trim() || null,
            });
            onSuccess();
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
                background: 'rgba(3,11,22,0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
        >
            <div
                className="scaleIn"
                style={{
                    background: 'linear-gradient(160deg, #06111f 0%, #091828 100%)',
                    border: '1px solid rgba(56,139,253,0.2)',
                    borderRadius: '20px', padding: '36px',
                    width: '100%', maxWidth: '460px', margin: '16px',
                    boxShadow: '0 0 60px rgba(56,139,253,0.1), 0 24px 80px rgba(0,0,0,0.7)',
                    position: 'relative',
                }}
            >
                <button onClick={onClose} style={{
                    position: 'absolute', top: '14px', right: '16px',
                    background: 'transparent', border: 'none',
                    color: '#3d6080', fontSize: '22px', cursor: 'pointer',
                }}>×</button>

                {/* Book header */}
                <div style={{
                    display: 'flex', gap: '16px', alignItems: 'flex-start',
                    marginBottom: '28px', paddingBottom: '24px',
                    borderBottom: '1px solid rgba(56,139,253,0.1)',
                }}>
                    <div style={{
                        width: '56px', height: '82px', borderRadius: '7px',
                        overflow: 'hidden', flexShrink: 0, background: '#0d2038',
                        border: '1px solid rgba(56,139,253,0.15)',
                    }}>
                        {coverUrl
                            ? <img src={coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>📖</div>
                        }
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '17px', lineHeight: 1.3, marginBottom: '4px' }}>{book.title}</h3>
                        {book.author_name?.[0] && (
                            <p style={{ fontSize: '13px', color: '#3d6080' }}>{book.author_name[0]}</p>
                        )}
                        {book.first_publish_year && (
                            <p style={{ fontSize: '12px', color: '#1e3a52', marginTop: '2px' }}>{book.first_publish_year}</p>
                        )}
                    </div>
                </div>

                {/* Rating */}
                <div style={{ marginBottom: '20px' }}>
                    <Label>Tu calificación</Label>
                    <StarRating value={rating} onChange={setRating} size="xl" showLabel />
                </div>

                {/* Review text */}
                <div style={{ marginBottom: '20px' }}>
                    <Label>Reseña <span style={{ color: '#1e3a52', fontWeight: 400 }}>(opcional)</span></Label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="¿Qué te pareció el libro?"
                        style={{
                            width: '100%', minHeight: '100px',
                            background: '#0d2038',
                            border: '1px solid rgba(56,139,253,0.15)',
                            borderRadius: '10px',
                            color: '#ddeeff', fontSize: '14px',
                            padding: '12px 14px', resize: 'vertical',
                            fontFamily: "'Figtree', sans-serif", lineHeight: 1.65,
                            outline: 'none', transition: 'border-color 0.18s, box-shadow 0.18s',
                        }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(56,139,253,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(56,139,253,0.08)'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(56,139,253,0.15)'; e.target.style.boxShadow = 'none'; }}
                    />
                </div>

                {error && <p style={{ color: '#f85149', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 20px', background: 'transparent',
                            border: '1px solid rgba(56,139,253,0.15)', borderRadius: '10px',
                            color: '#7fafd4', cursor: 'pointer', fontSize: '14px',
                            fontFamily: "'Figtree', sans-serif", transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.target.style.borderColor = 'rgba(56,139,253,0.3)'; e.target.style.color = '#ddeeff'; }}
                        onMouseLeave={e => { e.target.style.borderColor = 'rgba(56,139,253,0.15)'; e.target.style.color = '#7fafd4'; }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading}
                        style={{
                            flex: 1, padding: '12px',
                            background: loading ? '#1a3f6f' : 'linear-gradient(135deg, #388bfd, #1a6bcc)',
                            color: '#fff', fontWeight: '700', fontSize: '15px',
                            borderRadius: '10px', border: 'none',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: "'Figtree', sans-serif",
                            boxShadow: loading ? 'none' : '0 0 16px rgba(56,139,253,0.3)',
                            transition: 'all 0.18s',
                        }}
                    >
                        {loading ? 'Guardando...' : 'Guardar reseña'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Label({ children }) {
    return (
        <label style={{
            display: 'block', fontSize: '11px', fontWeight: '600',
            color: '#7fafd4', marginBottom: '10px',
            letterSpacing: '0.6px', textTransform: 'uppercase',
        }}>{children}</label>
    );
}
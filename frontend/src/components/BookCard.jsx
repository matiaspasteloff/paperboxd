import { useState } from 'react';

export default function BookCard({ book, onRate, onNavigate, loggedIn, compact = false }) {
    const [hov, setHov] = useState(false);
    const coverUrl = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null;

    return (
        <div
            onClick={() => onNavigate && onNavigate(book)}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: 'var(--surface)',
                border: `1px solid ${hov ? 'var(--border-2)' : 'var(--border)'}`,
                borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
                transform: hov ? 'translateY(-5px) scale(1.01)' : 'translateY(0) scale(1)',
                transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                boxShadow: hov ? '0 16px 40px rgba(0,0,0,0.4), 0 0 20px var(--accent-glow)' : '0 2px 8px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column',
            }}
        >
            <div style={{ position: 'relative', paddingTop: '148%', background: 'var(--surface-2)', overflow: 'hidden', flexShrink: 0 }}>
                {coverUrl
                    ? <img src={coverUrl} alt={book.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.3s' }} />
                    : <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-3)', gap: '6px' }}>
                        <span style={{ fontSize: '28px' }}>📚</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', padding: '0 6px' }}>Sin portada</span>
                    </div>
                }

                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                    opacity: hov ? 1 : 0, transition: 'opacity 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '10px', gap: '6px',
                }}>
                    <button onClick={(e) => { e.stopPropagation(); onNavigate && onNavigate(book); }} style={{
                        width: '100%', padding: '7px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: '7px', color: '#fff', fontSize: '12px', fontWeight: '600',
                        cursor: 'pointer', fontFamily: "'Figtree',sans-serif", transition: 'background 0.15s',
                    }}
                        onMouseEnter={e => (e.target.style.background = 'rgba(255,255,255,0.2)')}
                        onMouseLeave={e => (e.target.style.background = 'rgba(255,255,255,0.1)')}
                    >Ver detalles</button>
                    {loggedIn && (
                        <button onClick={(e) => { e.stopPropagation(); onRate && onRate(book); }} style={{
                            width: '100%', padding: '7px', background: 'var(--accent)', border: 'none',
                            borderRadius: '7px', color: '#fff', fontSize: '12px', fontWeight: '700',
                            cursor: 'pointer', fontFamily: "'Figtree',sans-serif",
                        }}
                            onMouseEnter={e => (e.target.style.background = 'var(--accent-2)')}
                            onMouseLeave={e => (e.target.style.background = 'var(--accent)')}
                        >+ Reseñar</button>
                    )}
                </div>
            </div>

            {!compact && (
                <div style={{ padding: '11px 12px 12px', flex: 1 }}>
                    <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '13px', fontWeight: '600', lineHeight: 1.3, color: 'var(--text)', marginBottom: '3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{book.title}</p>
                    {book.author_name?.[0] && <p style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.author_name[0]}</p>}
                    {book.first_publish_year && <p style={{ fontSize: '10px', color: 'var(--surface-4)', marginTop: '3px' }}>{book.first_publish_year}</p>}
                </div>
            )}
        </div>
    );
}
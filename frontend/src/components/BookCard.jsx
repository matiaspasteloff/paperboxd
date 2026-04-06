import { useState } from 'react';
import StarRating from './StarRating';

export default function BookCard({ book, onRate, onNavigate, loggedIn, compact = false }) {
    const [hov, setHov] = useState(false);

    const coverUrl = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null;

    const workId = book.key?.replace('/works/', '') || '';

    const handleCardClick = () => {
        if (workId) onNavigate(book);
    };

    const handleRate = (e) => {
        e.stopPropagation();
        onRate(book);
    };

    return (
        <div
            onClick={handleCardClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: hov
                    ? 'linear-gradient(160deg, #091828 0%, #0d2038 100%)'
                    : 'linear-gradient(160deg, #06111f 0%, #091828 100%)',
                border: `1px solid ${hov ? 'rgba(56,139,253,0.3)' : 'rgba(56,139,253,0.1)'}`,
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                transform: hov ? 'translateY(-5px) scale(1.01)' : 'translateY(0) scale(1)',
                transition: 'transform 0.22s cubic-bezier(0.22,1,0.36,1), border-color 0.2s, box-shadow 0.2s, background 0.2s',
                boxShadow: hov
                    ? '0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,139,253,0.1), 0 0 30px rgba(56,139,253,0.06)'
                    : '0 2px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Cover */}
            <div style={{ position: 'relative', paddingTop: '148%', background: '#091828', overflow: 'hidden', flexShrink: 0 }}>
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={book.title}
                        loading="lazy"
                        style={{
                            position: 'absolute', inset: 0, width: '100%', height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s',
                            transform: hov ? 'scale(1.04)' : 'scale(1)',
                        }}
                    />
                ) : (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(135deg, #091828, #0d2038)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: '8px',
                    }}>
                        <span style={{ fontSize: '32px' }}>📚</span>
                        <span style={{ fontSize: '10px', color: '#3d6080', textAlign: 'center', padding: '0 8px' }}>
                            Sin portada
                        </span>
                    </div>
                )}

                {/* Overlay: "Ver + Reseñar" */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(3,11,22,0.92) 0%, rgba(3,11,22,0.4) 50%, transparent 100%)',
                    opacity: hov ? 1 : 0,
                    transition: 'opacity 0.2s',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'flex-end',
                    padding: '12px',
                    gap: '6px',
                }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                        style={{
                            width: '100%', padding: '7px',
                            background: 'rgba(56,139,253,0.15)',
                            border: '1px solid rgba(56,139,253,0.35)',
                            borderRadius: '7px', color: '#58a6ff',
                            fontSize: '12px', fontWeight: '600',
                            cursor: 'pointer', fontFamily: "'Figtree', sans-serif",
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.target.style.background = 'rgba(56,139,253,0.25)')}
                        onMouseLeave={e => (e.target.style.background = 'rgba(56,139,253,0.15)')}
                    >
                        Ver detalles
                    </button>
                    {loggedIn && (
                        <button
                            onClick={handleRate}
                            style={{
                                width: '100%', padding: '7px',
                                background: '#388bfd',
                                border: 'none', borderRadius: '7px',
                                color: '#fff', fontSize: '12px', fontWeight: '700',
                                cursor: 'pointer', fontFamily: "'Figtree', sans-serif",
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => (e.target.style.background = '#58a6ff')}
                            onMouseLeave={e => (e.target.style.background = '#388bfd')}
                        >
                            + Reseñar
                        </button>
                    )}
                </div>
            </div>

            {/* Info */}
            {!compact && (
                <div style={{ padding: '11px 12px 12px', flex: 1 }}>
                    <p style={{
                        fontFamily: "'Syne', sans-serif", fontSize: '13px', fontWeight: '600',
                        lineHeight: 1.3, color: '#ddeeff', marginBottom: '3px',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{book.title}</p>
                    {book.author_name?.[0] && (
                        <p style={{ fontSize: '11px', color: '#3d6080', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {book.author_name[0]}
                        </p>
                    )}
                    {book.first_publish_year && (
                        <p style={{ fontSize: '11px', color: '#1e3a52', marginTop: '4px' }}>
                            {book.first_publish_year}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
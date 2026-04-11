import { useState } from 'react';

export default function BookCard({ book, onRate, onNavigate, loggedIn, compact = false }) {
  const [hov, setHov] = useState(false);

  const coverUrl = book.cover_url
    || (book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null);

  return (
    <div
      onClick={() => onNavigate && onNavigate(book)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hov ? 'var(--border-2)' : 'var(--border)'}`,
        borderRadius: '4px',
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), border-color 0.2s, box-shadow 0.25s',
        boxShadow: hov ? '0 20px 48px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Cover */}
      <div style={{
        position: 'relative',
        paddingTop: '152%',
        background: 'var(--surface-3)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            loading="lazy"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              transform: hov ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.35s ease',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface-3)',
            gap: '8px',
          }}>
            <div style={{
              width: '32px', height: '40px',
              borderLeft: '3px solid var(--border-3)',
              borderRight: '1px solid var(--border-2)',
              background: 'var(--surface-4)',
              borderRadius: '1px',
            }} />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', padding: '0 8px', lineHeight: 1.4 }}>
              Sin portada
            </span>
          </div>
        )}

        {/* Rating badge */}
        {book.average_rating && (
          <div style={{
            position: 'absolute', top: '8px', left: '8px',
            background: 'rgba(0,0,0,0.8)',
            borderRadius: '3px',
            padding: '2px 7px',
            fontSize: '11px',
            color: 'var(--star)',
            fontWeight: '700',
            backdropFilter: 'blur(4px)',
            fontFamily: "'Lato', sans-serif",
          }}>
            {book.average_rating.toFixed(1)}
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
          opacity: hov ? 1 : 0,
          transition: 'opacity 0.22s',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '12px',
          gap: '7px',
        }}>
          <button
            onClick={e => { e.stopPropagation(); onNavigate && onNavigate(book); }}
            style={{
              width: '100%', padding: '8px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '12px', fontWeight: '700',
              cursor: 'pointer',
              fontFamily: "'Lato', sans-serif",
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.target.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => (e.target.style.background = 'rgba(255,255,255,0.12)')}
          >
            Ver detalles
          </button>
          {loggedIn && (
            <button
              onClick={e => { e.stopPropagation(); onRate && onRate(book); }}
              style={{
                width: '100%', padding: '8px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '12px', fontWeight: '700',
                cursor: 'pointer',
                fontFamily: "'Lato', sans-serif",
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.target.style.background = 'var(--accent-2)')}
              onMouseLeave={e => (e.target.style.background = 'var(--accent)')}
            >
              Reseñar
            </button>
          )}
        </div>
      </div>

      {/* Metadata */}
      {!compact && (
        <div style={{ padding: '10px 11px 12px', flex: 1 }}>
          <p style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: '13px',
            fontWeight: '700',
            lineHeight: 1.35,
            color: 'var(--text)',
            marginBottom: '3px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {book.title}
          </p>
          {book.author_name?.[0] && (
            <p style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontStyle: 'italic',
              fontFamily: "'Lato', sans-serif",
            }}>
              {book.author_name[0]}
            </p>
          )}
          {book.first_publish_year && (
            <p style={{ fontSize: '10px', color: 'var(--surface-4)', marginTop: '4px', fontFamily: "'Lato', sans-serif" }}>
              {book.first_publish_year}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
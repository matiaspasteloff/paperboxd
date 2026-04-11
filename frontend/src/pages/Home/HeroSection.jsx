export default function HeroSection({ query, setQuery, onSearch, user, hasResults, onAuthClick, isMobile }) {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: `80px ${isMobile ? '20px' : '40px'} 60px`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle grid texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 80%)',
        opacity: 0.6,
      }} />

      {/* Warm glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(200,148,58,0.06) 0%, transparent 70%)',
      }} />

      {/* Eyebrow label */}
      <div className="fadeUp" style={{
        animationDelay: '0.05s',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        color: 'var(--accent)',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        fontFamily: "'Lato', sans-serif",
      }}>
        <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
        Tu diario de lectura
        <span style={{ width: '24px', height: '1px', background: 'var(--accent)', display: 'inline-block' }} />
      </div>

      {/* Main headline — editorial serif */}
      <h1 className="fadeUp" style={{
        animationDelay: '0.12s',
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: isMobile ? '52px' : 'clamp(60px, 10vw, 110px)',
        fontWeight: 700,
        letterSpacing: isMobile ? '-1px' : '-2px',
        lineHeight: 0.92,
        marginBottom: '28px',
        color: 'var(--text)',
      }}>
        Paper
        <em style={{
          fontStyle: 'italic',
          color: 'var(--accent)',
          display: 'block',
        }}>Boxd</em>
      </h1>

      {/* Tagline */}
      <p className="fadeUp" style={{
        animationDelay: '0.22s',
        fontSize: isMobile ? '14px' : '16px',
        color: 'var(--text-dim)',
        maxWidth: '380px',
        lineHeight: 1.8,
        marginBottom: '44px',
        fontFamily: "'Lato', sans-serif",
        fontWeight: 300,
        fontStyle: 'italic',
      }}>
        Registrá, calificá y reseñá tus lecturas.<br />
        Descubrí qué leen otros.
      </p>

      {/* Search */}
      <div className="fadeUp" style={{ animationDelay: '0.32s', width: '100%', maxWidth: '500px' }}>
        <div style={{
          display: 'flex',
          background: 'var(--surface)',
          border: '1px solid var(--border-2)',
          borderRadius: '6px',
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 0 0 0 var(--accent-glow)',
          transition: 'box-shadow 0.2s',
        }}
          onFocus={e => e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.4), 0 0 0 2px var(--accent-sub)'}
          onBlur={e => e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.4)'}
        >
          <input
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              fontSize: isMobile ? '16px' : '15px',
              padding: isMobile ? '16px 14px' : '16px 18px',
              outline: 'none',
              fontFamily: "'Lato', sans-serif",
              fontStyle: 'italic',
            }}
            placeholder={isMobile ? 'Buscá un libro...' : 'Título, autor o ISBN...'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
          />
          <button
            onClick={onSearch}
            style={{
              background: 'var(--accent)',
              border: 'none',
              color: '#fff',
              fontWeight: '700',
              fontSize: '12px',
              padding: '0 22px',
              cursor: 'pointer',
              fontFamily: "'Lato', sans-serif",
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.target.style.background = 'var(--accent-2)')}
            onMouseLeave={e => (e.target.style.background = 'var(--accent)')}
          >
            {isMobile ? '→' : 'Buscar'}
          </button>
        </div>

        {!user && (
          <p style={{
            marginTop: '14px',
            color: 'var(--text-muted)',
            fontSize: '12px',
            fontFamily: "'Lato', sans-serif",
          }}>
            <span
              onClick={onAuthClick}
              style={{ color: 'var(--accent)', cursor: 'pointer', borderBottom: '1px solid var(--accent-sub)' }}
            >
              Ingresá
            </span>{' '}para reseñar y guardar libros
          </p>
        )}
      </div>

      {/* Subtle scroll indicator */}
      {!hasResults && (
        <div className="fadeUp" style={{
          animationDelay: '0.6s',
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          fontSize: '10px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          fontFamily: "'Lato', sans-serif",
        }}>
          <div style={{
            width: '1px',
            height: '32px',
            background: 'linear-gradient(to bottom, transparent, var(--text-muted))',
            animation: 'pulse 2s ease infinite',
          }} />
          scroll
        </div>
      )}
    </section>
  );
}
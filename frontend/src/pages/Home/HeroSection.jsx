export default function HeroSection({ query, setQuery, onSearch, user, hasResults, onAuthClick, isMobile }) {
  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: `80px ${isMobile ? '20px' : '24px'} 40px`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 70% 50% at 50% 20%, var(--accent-sub) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px),linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)' }} />

      <div className="fadeUp badge" style={{ animationDelay: '0.05s', marginBottom: '24px' }}>✦ Tu diario de lectura personal</div>

      <h1 className="fadeUp" style={{ animationDelay: '0.15s', fontFamily: "'Syne',sans-serif", fontSize: isMobile ? '42px' : 'clamp(46px,9vw,96px)', fontWeight: 800, letterSpacing: isMobile ? '-1.5px' : '-2px', lineHeight: 0.95, marginBottom: '18px' }}>
        PAPER<br />
        <span style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-3) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BOXD</span>
      </h1>

      <p className="fadeUp" style={{ animationDelay: '0.25s', fontSize: isMobile ? '15px' : '17px', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.7, marginBottom: '36px' }}>
        Registrá, calificá, reseñá y descubrí qué opinan otros lectores.
      </p>

      <div className="fadeUp" style={{ animationDelay: '0.35s', width: '100%', maxWidth: '540px' }}>
        <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
          {!isMobile && <span style={{ padding: '0 0 0 16px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '16px' }}>🔍</span>}
          <input
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', fontSize: isMobile ? '16px' : '15px', padding: isMobile ? '14px' : '16px 14px', outline: 'none', fontFamily: "'Figtree',sans-serif" }}
            placeholder={isMobile ? 'Buscá un libro...' : 'Buscá un título, autor o ISBN...'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
          />
          <button onClick={onSearch} style={{ background: 'var(--accent)', border: 'none', color: '#fff', fontWeight: '700', fontSize: '14px', padding: '0 20px', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>
            {isMobile ? '🔍' : 'Buscar'}
          </button>
        </div>

        {!user && hasResults && (
          <p style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <span onClick={onAuthClick} style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }}>Ingresá</span> para reseñar libros
          </p>
        )}
      </div>
    </section>
  );
}
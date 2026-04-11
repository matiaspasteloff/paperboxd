import StarRating from '../../components/StarRating';

export default function BookHeader({ book, merged, reviews, progress, user, isMobile, onAddProgress, onReview, onDNF, onAuthClick }) {
  const coverUrl = book.cover_url || (book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const ratingDist = [5, 4, 3, 2, 1].map(s => ({ s, c: reviews.filter(r => Math.round(r.rating) === s).length }));
  const maxC = Math.max(...ratingDist.map(d => d.c), 1);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: `28px ${isMobile ? '16px' : '32px'} 40px`, display: 'flex', gap: isMobile ? '20px' : '40px', flexWrap: isMobile ? 'nowrap' : 'wrap', alignItems: 'flex-start' }}>
      {/* Cover */}
      <div style={{ width: isMobile ? '110px' : '180px', height: isMobile ? '162px' : '265px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: 'var(--surface-2)', border: '1px solid var(--border)', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
        {coverUrl ? <img src={coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>📚</div>}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 className="fadeUp" style={{ fontSize: isMobile ? '22px' : 'clamp(22px,4vw,38px)', lineHeight: 1.15, marginBottom: '8px' }}>{book.title}</h1>
        {book.author_name?.[0] && <p style={{ color: 'var(--text-dim)', fontSize: isMobile ? '14px' : '16px', marginBottom: '4px' }}>por <span style={{ color: 'var(--accent-2)' }}>{book.author_name[0]}</span></p>}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          {merged.first_publish_year && <span>📅 {merged.first_publish_year}</span>}
          {merged.page_count > 0     && <span>📄 {merged.page_count} pág.</span>}
          {merged.publisher          && <span>🏢 {merged.publisher}</span>}
          {merged.categories?.[0]    && <span>🏷 {merged.categories[0]}</span>}
        </div>

        {merged.average_rating && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.25)', borderRadius: '8px', padding: '5px 12px', marginBottom: '16px', fontSize: '12px', color: 'var(--star)' }}>
            ★ {merged.average_rating.toFixed(1)} · {merged.ratings_count?.toLocaleString()} valoraciones (Google)
          </div>
        )}

        {avgRating && (
          <div style={{ display: 'inline-flex', gap: isMobile ? '12px' : '18px', alignItems: 'center', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '12px', padding: isMobile ? '12px 14px' : '16px 22px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? '28px' : '38px', fontWeight: 800, lineHeight: 1 }}>{avgRating}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{reviews.length} reseñas</div>
            </div>
            <div>
              <StarRating value={Math.round(parseFloat(avgRating))} size={isMobile ? 'md' : 'lg'} />
              {!isMobile && ratingDist.map(({ s, c }) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '10px' }}>{s}</span>
                  <span style={{ color: 'var(--star)', fontSize: '10px' }}>★</span>
                  <div style={{ width: '72px', height: '4px', background: 'var(--surface-3)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(c / maxC) * 100}%`, background: 'var(--accent)', borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {user && (
            <button onClick={onAddProgress} style={{ padding: isMobile ? '10px 14px' : '11px 20px', background: progress ? 'var(--accent-sub)' : 'var(--accent)', color: progress ? 'var(--accent-2)' : '#fff', border: progress ? '1px solid var(--border-2)' : 'none', borderRadius: '10px', fontSize: isMobile ? '13px' : '14px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", boxShadow: progress ? 'none' : '0 0 16px var(--accent-glow)' }}>
              {progress ? `📖 ${Math.round((progress.current_page / Math.max(progress.total_pages, 1)) * 100)}%` : '📖 Agregar'}
            </button>
          )}
          <button onClick={() => user ? onReview() : onAuthClick()} style={{ padding: isMobile ? '10px 14px' : '11px 20px', background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: '10px', fontSize: isMobile ? '13px' : '14px', fontWeight: '700', color: 'var(--text)', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>
            ✍️ {user ? 'Reseñar' : 'Ingresar para reseñar'}
          </button>
          {user && (
            <button onClick={onDNF} style={{ padding: isMobile ? '10px 12px' : '11px 16px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '10px', fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: 'var(--danger)', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>
              🚫 DNF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
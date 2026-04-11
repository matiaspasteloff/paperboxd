import StarRating from '../../components/StarRating';
import Empty from '../../components/ui/Empty';

export default function LibraryTab({ reviews, navigate }) {
  if (!reviews.length) return (
    <Empty icon="📚" title="Tu biblioteca está vacía" sub="Buscá un libro y dejá tu primera reseña." />
  );

  return (
    <div className="card-grid">
      {reviews.map((r, i) => (
        <div
          key={r.id}
          className="fadeUp"
          onClick={() => navigate('book', { key: `/works/${r.open_library_work_id}`, title: r.book.title, cover_i: r.book.cover_url?.match(/\/b\/id\/(\d+)/)?.[1] })}
          style={{ animationDelay: `${i * 0.04}s`, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ position: 'relative', paddingTop: '145%', background: 'var(--surface-2)' }}>
            {r.book.cover_url
              ? <img src={r.book.cover_url} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>📖</div>
            }
            <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', borderRadius: '7px', padding: '3px 8px', fontSize: '12px', fontWeight: '700', color: 'var(--star)' }}>★ {r.rating}</div>
          </div>
          <div style={{ padding: '12px' }}>
            <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '13px', fontWeight: '700', lineHeight: 1.3, color: 'var(--text)', marginBottom: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.book.title}</p>
            <StarRating value={r.rating} size="sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
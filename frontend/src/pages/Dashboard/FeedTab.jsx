import StarRating from '../../components/StarRating';
import Avatar from '../../components/Navbar/Avatar';
import Empty from '../../components/ui/Empty';

export default function FeedTab({ feed, navigate, isMobile }) {
  if (!feed.length) return (
    <Empty icon="📰" title="Tu feed está vacío" sub="Seguí a otros lectores para ver sus reseñas acá." />
  );

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {feed.map((item, i) => (
        <div
          key={item.id}
          className="fadeUp"
          style={{ animationDelay: `${i * 0.04}s`, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: isMobile ? '16px' : '20px 24px', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <button onClick={() => navigate('profile', item.username)} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
              <Avatar name={item.username} color={item.avatar_color} size={36} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <button onClick={() => navigate('profile', item.username)} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontWeight: '700', fontSize: '14px', color: 'var(--accent-2)' }}>@{item.username}</button>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>reseñó un libro</span>
                <StarRating value={item.rating} size="sm" />
                {item.created_at && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(item.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>}
              </div>
              {item.review_text && (
                <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '10px' }}>"{item.review_text}"</p>
              )}
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {item.mood_tags?.split(',').filter(Boolean).map(m => (
                  <span key={m} style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--surface-3)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '100px' }}>{m}</span>
                ))}
                {item.genre && <span style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--accent-sub)', color: 'var(--accent-2)', border: '1px solid var(--border-2)', borderRadius: '100px' }}>📚 {item.genre}</span>}
                <button onClick={() => navigate('book', { key: `/works/${item.open_library_work_id}`, title: 'Ver libro', cover_i: null })} style={{ fontSize: '11px', padding: '2px 8px', background: 'transparent', color: 'var(--accent)', border: '1px solid var(--border-2)', borderRadius: '100px', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", marginLeft: 'auto' }}>Ver libro →</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
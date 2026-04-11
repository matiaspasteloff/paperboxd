import StarRating from '../../components/StarRating';
import Spinner from '../../components/ui/Spinner';

const MOOD_COLORS = { oscuro: '#3d3d80', emotivo: '#803d6a', relajante: '#3d804a', épico: '#80623d', misterioso: '#3d5280', romántico: '#80463d', filosófico: '#5d3d80', humorístico: '#7a7a3d' };

export default function ReviewsList({ reviews, loading, isMobile }) {
  return (
    <div style={{ borderTop: '1px solid var(--border)', maxWidth: '1100px', margin: '0 auto', padding: `36px ${isMobile ? '16px' : '32px'} 80px` }}>
      <h2 style={{ fontSize: isMobile ? '18px' : '22px', marginBottom: '24px' }}>
        Reseñas de la comunidad
        <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400, fontFamily: "'Figtree',sans-serif", marginLeft: '10px' }}>({reviews.length})</span>
      </h2>

      {loading ? (
        <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', padding: '20px 0', alignItems: 'center' }}>
          <Spinner /> Cargando reseñas...
        </div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--accent-sub)', border: '1px solid var(--border)', borderRadius: '14px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>✍️</div>
          <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>¡Sé el primero en reseñar este libro!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviews.map((r, i) => (
            <div key={r.id} className="fadeUp" style={{ animationDelay: `${i * 0.04}s`, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: isMobile ? '16px' : '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', fontFamily: "'Syne',sans-serif" }}>{r.username[0].toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px', fontFamily: "'Syne',sans-serif" }}>{r.username}</span>
                    <StarRating value={r.rating} size="sm" />
                    <span style={{ padding: '2px 8px', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '100px', fontSize: '11px', color: 'var(--accent-2)', fontWeight: '600' }}>{r.rating}/5</span>
                  </div>
                  {r.review_text && <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '8px' }}>"{r.review_text}"</p>}
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {r.mood_tags?.split(',').filter(Boolean).map(m => <span key={m} style={{ fontSize: '11px', padding: '2px 8px', background: MOOD_COLORS[m] ? MOOD_COLORS[m] + '28' : 'var(--surface-3)', color: MOOD_COLORS[m] || 'var(--text-muted)', border: `1px solid ${MOOD_COLORS[m] ? MOOD_COLORS[m] + '55' : 'var(--border)'}`, borderRadius: '100px' }}>{m}</span>)}
                    {r.pace_tag && <span style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--surface-3)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '100px' }}>⚡ {r.pace_tag}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
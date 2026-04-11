import { useState } from 'react';
import StarRating from '../../components/StarRating';
import Avatar from '../../components/Navbar/Avatar';

export default function ReviewRow({ review, index, navigate, username, color }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="fadeUp"
      style={{ animationDelay: `${index * 0.04}s`, background: hov ? 'var(--surface-2)' : 'var(--surface)', border: `1px solid ${hov ? 'var(--border-2)' : 'var(--border)'}`, borderRadius: '14px', padding: '16px 18px', transition: 'all 0.2s', cursor: 'pointer' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => navigate('book', { key: `/works/${review.open_library_work_id}`, title: '...', cover_i: null })}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Avatar name={username} color={color} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <StarRating value={review.rating} size="sm" />
            <span style={{ padding: '2px 8px', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '100px', fontSize: '11px', color: 'var(--accent-2)', fontWeight: '600' }}>{review.rating}/5</span>
            {review.created_at && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {new Date(review.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
          {review.review_text && (
            <p style={{ fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '8px' }}>"{review.review_text}"</p>
          )}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {review.mood_tags?.split(',').filter(Boolean).map(m => (
              <span key={m} style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--surface-3)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '100px' }}>{m}</span>
            ))}
            {review.genre && (
              <span style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--accent-sub)', color: 'var(--accent-2)', border: '1px solid var(--border-2)', borderRadius: '100px' }}>📚 {review.genre}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
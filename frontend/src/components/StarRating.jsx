import { useState } from 'react';

export default function StarRating({ value = 0, onChange, size = 'md', showLabel = false }) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;
  const fs = { sm:'13px', md:'18px', lg:'26px', xl:'32px' }[size] || '18px';
  const gap = size === 'sm' ? '2px' : '4px';

  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap }}>
      {[1,2,3,4,5].map(star => {
        const active = star <= (hover || value);
        return (
          <span key={star}
            onClick={() => interactive && onChange(star)}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            style={{
              fontSize:fs, lineHeight:1, userSelect:'none',
              color: active ? 'var(--star)' : 'var(--surface-4)',
              cursor: interactive ? 'pointer' : 'default',
              transform: (interactive && hover >= star) ? 'scale(1.2)' : 'scale(1)',
              transition:'color 0.12s, transform 0.1s',
              display:'inline-block',
            }}
          >★</span>
        );
      })}
      {showLabel && value > 0 && <span style={{ fontSize:'13px', color:'var(--text-muted)', marginLeft:'4px' }}>{value}/5</span>}
    </span>
  );
}
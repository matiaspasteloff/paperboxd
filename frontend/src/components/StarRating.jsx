import { useState } from 'react';

export default function StarRating({ value = 0, onChange, size = 'md', showLabel = false }) {
    const [hover, setHover] = useState(0);
    const interactive = !!onChange;
    const fontSize = size === 'sm' ? '14px' : size === 'lg' ? '28px' : size === 'xl' ? '34px' : '20px';
    const gap = size === 'sm' ? '2px' : size === 'lg' || size === 'xl' ? '5px' : '3px';

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
            {Array.from({ length: 5 }, (_, i) => {
                const star = i + 1;
                const active = star <= (hover || value);
                return (
                    <span
                        key={star}
                        onClick={() => interactive && onChange(star)}
                        onMouseEnter={() => interactive && setHover(star)}
                        onMouseLeave={() => interactive && setHover(0)}
                        style={{
                            fontSize,
                            color: active ? '#e3b341' : '#1e3a52',
                            cursor: interactive ? 'pointer' : 'default',
                            transition: 'color 0.12s, transform 0.1s',
                            transform: (interactive && hover >= star) ? 'scale(1.2)' : 'scale(1)',
                            display: 'inline-block',
                            lineHeight: 1,
                            userSelect: 'none',
                        }}
                    >
                        ★
                    </span>
                );
            })}
            {showLabel && value > 0 && (
                <span style={{ fontSize: '13px', color: '#7fafd4', marginLeft: '4px', fontFamily: "'Figtree', sans-serif" }}>
                    {value}/5
                </span>
            )}
        </span>
    );
}
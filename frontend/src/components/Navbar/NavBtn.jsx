import { useState } from 'react';

export default function NavBtn({ active, onClick, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: active || hov ? 'var(--accent-sub)' : 'transparent',
        color: active ? 'var(--accent-2)' : hov ? 'var(--text)' : 'var(--text-dim)',
        border: active ? '1px solid var(--border-2)' : '1px solid transparent',
        fontSize: '14px',
        fontWeight: active ? '600' : '400',
        padding: '6px 13px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: "'Figtree',sans-serif",
      }}
    >
      {children}
    </button>
  );
}
import { useState } from 'react';

export default function NavBtn({ active, onClick, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'transparent',
        color: active ? 'var(--text)' : hov ? 'var(--text-dim)' : 'var(--text-muted)',
        border: 'none',
        borderBottom: active ? '1px solid var(--accent)' : '1px solid transparent',
        fontSize: '13px',
        fontWeight: active ? '700' : '400',
        padding: '6px 12px',
        borderRadius: '0',
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: "'Lato', sans-serif",
        letterSpacing: '0.2px',
      }}
    >
      {children}
    </button>
  );
}
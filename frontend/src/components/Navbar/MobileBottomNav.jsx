const NAV_LINKS = [
  { name: 'home',      label: 'Inicio',   icon: '🏠' },
  { name: 'explore',   label: 'Explorar', icon: '🔭' },
  { name: 'lists',     label: 'Listas',   icon: '📋' },
  { name: 'clubs',     label: 'Clubes',   icon: '💬' },
  { name: 'dashboard', label: 'Yo',       icon: '📚' },
];

export default function MobileBottomNav({ page, user, navigate, onAuthClick }) {
  const links = NAV_LINKS.filter(l => l.name !== 'dashboard' || user);

  return (
    <div className="mobile-nav">
      {links.map(({ name, icon, label }) => (
        <button
          key={name}
          onClick={() => navigate(name)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            padding: '6px 2px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: page.name === name ? 'var(--accent-2)' : 'var(--text-muted)',
            transition: 'color 0.15s',
          }}
        >
          <span style={{ fontSize: '19px', lineHeight: 1 }}>{icon}</span>
          <span style={{ fontSize: '10px', fontWeight: page.name === name ? '700' : '400', fontFamily: "'Figtree',sans-serif" }}>{label}</span>
          {page.name === name && (
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)', marginTop: '1px' }} />
          )}
        </button>
      ))}

      {!user && (
        <button
          onClick={onAuthClick}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '6px 2px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}
        >
          <span style={{ fontSize: '19px', lineHeight: 1 }}>👤</span>
          <span style={{ fontSize: '10px', fontWeight: '600', fontFamily: "'Figtree',sans-serif" }}>Entrar</span>
        </button>
      )}
    </div>
  );
}
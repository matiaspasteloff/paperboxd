const NAV_LINKS = [
  { name: 'home',      label: 'Inicio'   },
  { name: 'explore',   label: 'Explorar' },
  { name: 'lists',     label: 'Listas'   },
  { name: 'clubs',     label: 'Clubes'   },
  { name: 'dashboard', label: 'Yo'       },
];

const NAV_ICONS = {
  home:      ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  ),
  explore:   ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  lists:     ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" strokeLinecap="round" />
    </svg>
  ),
  clubs:     ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  dashboard: ({ active }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
      <path d="M16 3H8l-2 4h12l-2-4z" strokeLinejoin="round" />
    </svg>
  ),
  profile:   () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  ),
};

export default function MobileBottomNav({ page, user, navigate, onAuthClick }) {
  const links = NAV_LINKS.filter(l => l.name !== 'dashboard' || user);

  return (
    <div className="mobile-nav">
      {links.map(({ name, label }) => {
        const Icon = NAV_ICONS[name];
        const active = page.name === name;
        return (
          <button
            key={name}
            onClick={() => navigate(name)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 2px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color 0.15s',
            }}
          >
            {Icon && <Icon active={active} />}
            <span style={{
              fontSize: '10px',
              fontWeight: active ? '700' : '400',
              fontFamily: "'Lato', sans-serif",
              letterSpacing: '0.2px',
            }}>{label}</span>
            {active && (
              <div style={{
                width: '4px', height: '4px', borderRadius: '50%',
                background: 'var(--accent)', marginTop: '0px',
              }} />
            )}
          </button>
        );
      })}

      {!user && (
        <button
          onClick={onAuthClick}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '3px', padding: '6px 2px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--accent)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: '10px', fontWeight: '600', fontFamily: "'Lato', sans-serif" }}>Entrar</span>
        </button>
      )}
    </div>
  );
}
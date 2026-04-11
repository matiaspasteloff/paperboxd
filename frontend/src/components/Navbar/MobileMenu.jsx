import Avatar from './Avatar';
import SearchBar from './SearchBar';

const NAV_LINKS = [
  { name: 'home',      label: 'Inicio',        icon: '🏠' },
  { name: 'explore',   label: 'Explorar',      icon: '🔭' },
  { name: 'lists',     label: 'Listas',        icon: '📋' },
  { name: 'clubs',     label: 'Clubes',        icon: '💬' },
  { name: 'dashboard', label: 'Mi biblioteca', icon: '📚' },
];

export default function MobileMenu({ page, user, navigate, onAuthClick, onLogout, onClose }) {
  const go = (name, data = null) => { navigate(name, data); onClose(); };

  return (
    <div
      className="fadeIn"
      style={{
        position: 'fixed',
        top: '58px',
        left: 0,
        right: 0,
        zIndex: 99,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border-2)',
        padding: '12px 16px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <SearchBar onNavigate={go} isMobile />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '14px' }}>
        {NAV_LINKS.filter(l => l.name !== 'dashboard' || user).map(({ name, label, icon }) => (
          <button
            key={name}
            onClick={() => go(name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '10px',
              background: page.name === name ? 'var(--accent-sub)' : 'transparent',
              color: page.name === name ? 'var(--accent-2)' : 'var(--text-dim)',
              border: page.name === name ? '1px solid var(--border-2)' : '1px solid transparent',
              fontSize: '15px',
              fontWeight: page.name === name ? '600' : '400',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: "'Figtree',sans-serif",
            }}
          >
            <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => go('profile', user.username)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}
            >
              <Avatar name={user.username} color={user.avatar_color} size={28} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>@{user.username}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ver mi perfil</p>
              </div>
            </button>
            <button
              onClick={() => { onLogout(); onClose(); }}
              style={{ padding: '11px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '10px', color: 'var(--danger)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <button
            onClick={() => { onAuthClick(); onClose(); }}
            className="btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '15px' }}
          >
            Ingresar / Registrarse
          </button>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { api } from '../../api';
import Avatar from './Avatar';

export default function SearchBar({ onNavigate, isMobile = false }) {
  const [searchQ,    setSearchQ]   = useState('');
  const [searchRes,  setSearchRes] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!searchQ.trim()) { setSearchRes([]); return; }
    const t = setTimeout(async () => {
      try {
        const data = await api.searchUsers(searchQ);
        setSearchRes(data);
      } catch { setSearchRes([]); }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQ]);

  const goProfile = (username) => {
    onNavigate('profile', username);
    setSearchOpen(false);
    setSearchQ('');
  };

  const inputStyle = isMobile
    ? { width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '16px', padding: '10px 14px', outline: 'none', fontFamily: "'Figtree',sans-serif", boxSizing: 'border-box' }
    : { flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '13px', padding: '8px 10px 8px 0', outline: 'none', fontFamily: "'Figtree',sans-serif" };

  return (
    <div style={{ position: 'relative', flex: isMobile ? undefined : 1, maxWidth: isMobile ? undefined : '240px', zIndex: 101 }} ref={searchRef}>
      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          <span style={{ padding: '0 10px', color: 'var(--text-muted)', fontSize: '14px', flexShrink: 0 }}>🔍</span>
          <input value={searchQ} onChange={e => { setSearchQ(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} placeholder="Buscar usuarios..." style={inputStyle} />
        </div>
      )}
      {isMobile && (
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar usuarios..." style={inputStyle} />
      )}

      {searchOpen && searchRes.length > 0 && (
        <div className="scaleIn" style={{ position: isMobile ? 'static' : 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '12px', overflow: 'hidden', boxShadow: isMobile ? 'none' : '0 8px 32px rgba(0,0,0,0.5)', zIndex: 300, marginTop: isMobile ? '6px' : 0 }}>
          {searchRes.slice(0, isMobile ? 5 : 6).map(u => (
            <div key={u.id} onClick={() => goProfile(u.username)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-sub)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Avatar name={u.username} color={u.avatar_color} size={28} />
              <div>
                <p style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text)' }}>@{u.username}</p>
                {u.bio && <p style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{u.bio}</p>}
              </div>
              {!isMobile && <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>{u.reviews_count} reseñas</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
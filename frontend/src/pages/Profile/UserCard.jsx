import { useState } from 'react';
import Avatar from '../../components/Navbar/Avatar';

export default function UserCard({ u, navigate }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => navigate('profile', u.username)}
      style={{ display: 'flex', alignItems: 'center', gap: '12px', background: hov ? 'var(--surface-2)' : 'var(--surface)', border: `1px solid ${hov ? 'var(--border-2)' : 'var(--border)'}`, borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', transition: 'all 0.18s' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Avatar name={u.username} color={u.avatar_color} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text)' }}>@{u.username}</p>
        {u.bio && <p style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</p>}
      </div>
      <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>→</span>
    </div>
  );
}
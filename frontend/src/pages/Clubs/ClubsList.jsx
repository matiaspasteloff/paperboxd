export default function ClubsList({ clubs, loading, activeId, isMobile, onSelect }) {
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '84px', borderRadius: '14px' }} />)}
    </div>
  );

  if (clubs.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--accent-sub)', border: '1px solid var(--border)', borderRadius: '18px' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
      <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Sin clubes todavía</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>¡Creá el primero!</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {clubs.map(club => (
        <div
          key={club.id}
          onClick={() => onSelect(club)}
          style={{ background: activeId === club.id && !isMobile ? 'var(--accent-sub)' : 'var(--surface)', border: `1px solid ${activeId === club.id && !isMobile ? 'var(--border-2)' : 'var(--border)'}`, borderRadius: '14px', padding: '12px 14px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', transition: 'all 0.15s' }}
        >
          <div style={{ width: '44px', height: '62px', borderRadius: '7px', overflow: 'hidden', background: 'var(--surface-2)', flexShrink: 0, border: '1px solid var(--border)' }}>
            {club.cover_url ? <img src={club.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '18px' }}>📖</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '14px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{club.name}</p>
            <p style={{ fontSize: '12px', color: 'var(--accent-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>{club.book_title}</p>
            <span className="badge" style={{ fontSize: '11px' }}>💬 {club.messages_count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
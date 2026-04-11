import { useState } from 'react';
import { api } from '../../api';
import Empty from '../../components/ui/Empty';

function ProgressCard({ p, token, onUpdate, isMobile }) {
  const [cur, setCur]     = useState(p.current_page);
  const [saving, setSaving] = useState(false);
  const pct = p.total_pages > 0 ? Math.min(100, Math.round((cur / p.total_pages) * 100)) : 0;

  const save = async () => {
    setSaving(true);
    await api.updateProgress(token, p.id, { current_page: cur }).catch(() => {});
    setSaving(false);
    onUpdate();
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: isMobile ? '14px' : '18px 20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
      <div style={{ width: isMobile ? '42px' : '52px', height: isMobile ? '60px' : '74px', borderRadius: '7px', overflow: 'hidden', background: 'var(--surface-2)', flexShrink: 0 }}>
        {p.cover_url ? <img src={p.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '18px' }}>📖</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? '13px' : '14px', fontWeight: '700', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.book_title}</p>
        <div style={{ height: '7px', background: 'var(--surface-3)', borderRadius: '4px', marginBottom: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', borderRadius: '4px', boxShadow: '0 0 8px var(--accent-glow)', transition: 'width 0.4s' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <input type="number" min="0" max={p.total_pages} value={cur} onChange={e => setCur(Number(e.target.value))} style={{ width: '64px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '13px', padding: '4px 8px', outline: 'none', fontFamily: "'Figtree',sans-serif" }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>/ {p.total_pages}</span>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: '800', fontSize: '14px', color: 'var(--accent)', marginLeft: 'auto' }}>{pct}%</span>
          <button onClick={save} disabled={saving} style={{ padding: '5px 12px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>{saving ? '...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}

export default function ProgressTab({ progress, token, onUpdate, isMobile }) {
  const reading = progress.filter(p => p.status === 'reading');
  const want    = progress.filter(p => p.status === 'want');

  if (!progress.length) return (
    <Empty icon="📖" title="Nada en progreso" sub="Buscá un libro y marcalo como 'Leyendo'." />
  );

  return (
    <div>
      {reading.length > 0 && (
        <>
          <h3 style={{ fontSize: '15px', marginBottom: '14px', color: 'var(--text-dim)' }}>📖 Leyendo ahora ({reading.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
            {reading.map(p => <ProgressCard key={p.id} p={p} token={token} onUpdate={onUpdate} isMobile={isMobile} />)}
          </div>
        </>
      )}
      {want.length > 0 && (
        <>
          <h3 style={{ fontSize: '15px', marginBottom: '14px', color: 'var(--text-dim)' }}>🔖 Quiero leer ({want.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
            {want.map(p => (
              <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '50px', borderRadius: '5px', overflow: 'hidden', background: 'var(--surface-2)', flexShrink: 0 }}>
                  {p.cover_url ? <img src={p.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '14px' }}>📚</span>}
                </div>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '13px', fontWeight: '700', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.book_title}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
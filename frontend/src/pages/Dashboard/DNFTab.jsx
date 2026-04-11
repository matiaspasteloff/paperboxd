import { api } from '../../api';
import Empty from '../../components/ui/Empty';

export default function DNFTab({ dnf, token, onUpdate }) {
  const remove = async (id) => {
    await api.deleteDNF(token, id).catch(() => {});
    onUpdate();
  };

  if (!dnf.length) return (
    <Empty icon="🚫" title="Sin libros abandonados" sub="Podés marcar un libro como DNF desde su página." />
  );

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '18px' }}>
        Los libros DNF no afectan tus estadísticas ni tu reto anual.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {dnf.map(d => (
          <div key={d.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px' }}>
            <div style={{ width: '36px', height: '52px', borderRadius: '5px', overflow: 'hidden', background: 'var(--surface-2)', flexShrink: 0 }}>
              {d.cover_url ? <img src={d.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '14px' }}>📚</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '13px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.book_title}</p>
              {d.reason && <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>"{d.reason}"</p>}
            </div>
            <span style={{ fontSize: '10px', padding: '3px 8px', background: 'rgba(248,81,73,0.1)', color: 'var(--danger)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '100px', flexShrink: 0 }}>DNF</span>
            <button onClick={() => remove(d.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
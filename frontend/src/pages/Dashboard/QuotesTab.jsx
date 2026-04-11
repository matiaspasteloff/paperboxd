import { api } from '../../api';
import Empty from '../../components/ui/Empty';

export default function QuotesTab({ quotes, token, onUpdate, onNew, isMobile }) {
  const remove = async (id) => {
    await api.deleteQuote(token, id).catch(() => {});
    onUpdate();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Tus frases guardadas</p>
        <button onClick={onNew} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>✨ Nueva tarjeta</button>
      </div>

      {quotes.length === 0
        ? <Empty icon="💬" title="Sin citas guardadas" sub="Creá una tarjeta de cita con el botón de arriba." />
        : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {quotes.map(q => (
              <div key={q.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', position: 'relative' }}>
                <button onClick={() => remove(q.id)} style={{ position: 'absolute', top: '10px', right: '12px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>×</button>
                <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{q.book_title}</p>
                <p style={{ fontFamily: "'Lora',Georgia,serif", fontStyle: 'italic', fontSize: '14px', lineHeight: 1.7, color: 'var(--text)', marginBottom: '10px' }}>"{q.quote_text}"</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>— {q.author_name}</p>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}
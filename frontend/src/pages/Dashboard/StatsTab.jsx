export default function StatsTab({ stats }) {
  if (!stats) return null;

  const genres = Object.entries(stats.genres || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const moods  = Object.entries(stats.mood_counts || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const months = Object.entries(stats.monthly_books || {}).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
  const maxM   = Math.max(...months.map(([, v]) => v), 1);
  const maxG   = Math.max(...genres.map(([, v]) => v), 1);

  return (
    <div className="stats-grid">
      {/* Monthly chart */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '18px' }}>📅 Libros por mes</h3>
        {months.length === 0
          ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Aún sin datos</p>
          : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '110px' }}>
              {months.map(([k, v]) => {
                const h = (v / maxM) * 100;
                const [y, m] = k.split('-');
                const lbl = new Date(y, m - 1).toLocaleString('es', { month: 'short' });
                return (
                  <div key={k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '9px', color: 'var(--accent)', fontWeight: '600' }}>{v}</span>
                    <div style={{ width: '100%', height: `${h}%`, minHeight: '4px', background: 'linear-gradient(to top, var(--accent), var(--accent-3))', borderRadius: '3px 3px 0 0' }} />
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>{lbl}</span>
                  </div>
                );
              })}
            </div>
          )
        }
      </div>

      {/* Genres */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '18px' }}>🏷 Géneros favoritos</h3>
        {genres.length === 0
          ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Etiquetá tus reseñas con géneros.</p>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {genres.map(([g, c]) => (
                <div key={g}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{g}</span>
                    <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '600' }}>{c}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--surface-3)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(c / maxG) * 100}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', borderRadius: '3px', transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* Moods */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '18px' }}>🌀 Moods más leídos</h3>
        {moods.length === 0
          ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Etiquetá tus reseñas con moods.</p>
          : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {moods.map(([m, c]) => (
                <span key={m} style={{ padding: '6px 14px', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '100px', fontSize: '13px', color: 'var(--accent-2)', fontWeight: '500' }}>
                  {m} <span style={{ fontWeight: '800', color: 'var(--accent)' }}>·{c}</span>
                </span>
              ))}
            </div>
          )
        }
      </div>

      {/* Rating distribution */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '18px' }}>⭐ Distribución de ratings</h3>
        {[5, 4, 3, 2, 1].map(star => {
          const c    = stats.rating_dist?.[star] || 0;
          const maxD = Math.max(...Object.values(stats.rating_dist || {}), 1);
          return (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', width: '12px', textAlign: 'right' }}>{star}</span>
              <span style={{ color: 'var(--star)', fontSize: '12px' }}>★</span>
              <div style={{ flex: 1, height: '8px', background: 'var(--surface-3)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(c / maxD) * 100}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', borderRadius: '4px', transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '18px' }}>{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
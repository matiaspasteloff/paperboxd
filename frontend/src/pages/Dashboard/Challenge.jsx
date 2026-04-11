export default function ChallengeTab({ goal, setGoal, editGoal, setEditGoal, saveGoal, challengePct, totalFinished, isMobile }) {
  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: isMobile ? '28px 20px' : '36px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '14px' }}>🏆</div>
        <h2 style={{ fontSize: isMobile ? '22px' : '26px', marginBottom: '6px' }}>Reto de Lectura {new Date().getFullYear()}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '28px' }}>Tu meta personal de libros para este año</p>

        {goal > 0 ? (
          <div style={{ marginBottom: '22px' }}>
            <svg viewBox="0 0 200 200" style={{ width: isMobile ? '150px' : '180px', height: isMobile ? '150px' : '180px', margin: '0 auto', display: 'block' }}>
              <circle cx="100" cy="100" r="80" fill="none" stroke="var(--surface-3)" strokeWidth="12" />
              <circle cx="100" cy="100" r="80" fill="none" stroke="url(#grad)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${2 * Math.PI * 80 * (1 - challengePct / 100)}`}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px', transition: 'stroke-dashoffset 1s ease' }}
              />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--accent-3)" />
                </linearGradient>
              </defs>
              <text x="100" y="94" textAnchor="middle" style={{ fontSize: '26px', fontWeight: '800', fill: 'var(--text)', fontFamily: "'Syne',sans-serif" }}>{challengePct}%</text>
              <text x="100" y="114" textAnchor="middle" style={{ fontSize: '11px', fill: 'var(--text-muted)', fontFamily: "'Figtree',sans-serif" }}>{totalFinished} / {goal}</text>
            </svg>
          </div>
        ) : (
          <div style={{ padding: '20px', background: 'var(--surface-2)', borderRadius: '12px', marginBottom: '20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Configurá una meta para trackear tu reto anual.</p>
          </div>
        )}

        {editGoal ? (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input type="number" min="1" max="365" value={goal} onChange={e => setGoal(e.target.value)} style={{ width: '90px', background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: '8px', color: 'var(--text)', fontSize: '18px', fontWeight: '700', padding: '8px 12px', textAlign: 'center', outline: 'none', fontFamily: "'Syne',sans-serif" }} />
            <span style={{ lineHeight: '42px', color: 'var(--text-muted)', fontSize: '14px' }}>libros</span>
            <button onClick={saveGoal} style={{ padding: '8px 20px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>Guardar</button>
            <button onClick={() => setEditGoal(false)} className="btn-ghost" style={{ padding: '8px 14px' }}>✕</button>
          </div>
        ) : (
          <button onClick={() => setEditGoal(true)} className="btn-ghost">
            {goal > 0 ? '⚙️ Cambiar meta' : '⚙️ Configurar meta'}
          </button>
        )}
      </div>
    </div>
  );
}
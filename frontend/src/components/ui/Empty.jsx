export default function Empty({ icon, title, sub }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: 'var(--accent-sub)',
        border: '1px solid var(--border)',
        borderRadius: '18px',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '14px' }}>{icon}</div>
      <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{sub}</p>
    </div>
  );
}
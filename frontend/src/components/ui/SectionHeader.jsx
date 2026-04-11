export default function SectionHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
      <h2 style={{
        whiteSpace: 'nowrap',
        fontSize: '11px',
        fontFamily: "'Lato', sans-serif",
        fontWeight: '700',
        letterSpacing: '1.8px',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
      }}>
        {title}
      </h2>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  );
}
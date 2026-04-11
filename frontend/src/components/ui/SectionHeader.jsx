export default function SectionHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
      <h2 style={{ whiteSpace: 'nowrap' }}>{title}</h2>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  );
}
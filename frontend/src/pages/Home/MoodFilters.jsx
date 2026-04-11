const MOOD_FILTERS = [
  { id: 'oscuro',      label: '🌑 Oscuro',     query: 'dark literature fiction' },
  { id: 'emotivo',     label: '💧 Emotivo',     query: 'emotional drama fiction' },
  { id: 'relajante',   label: '🌿 Relajante',   query: 'cozy slice of life' },
  { id: 'épico',       label: '⚔️ Épico',       query: 'epic fantasy adventure' },
  { id: 'misterioso',  label: '🔍 Misterioso',  query: 'mystery thriller suspense' },
  { id: 'filosófico',  label: '🧠 Filosófico',  query: 'philosophy essays ideas' },
  { id: 'romántico',   label: '💕 Romántico',   query: 'romance love story' },
  { id: 'humorístico', label: '😄 Humor',       query: 'humor comedy fiction' },
];

export { MOOD_FILTERS };

export default function MoodFilters({ activeMood, onMoodClick }) {
  return (
    <div className="tabs-scroll">
      {MOOD_FILTERS.map(m => (
        <button
          key={m.id}
          onClick={() => onMoodClick(m)}
          style={{
            padding: '8px 16px',
            borderRadius: '100px',
            fontSize: '13px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            background: activeMood === m.id ? 'var(--accent)' : 'var(--surface)',
            color: activeMood === m.id ? '#fff' : 'var(--text-dim)',
            border: `1px solid ${activeMood === m.id ? 'var(--accent)' : 'var(--border-2)'}`,
            cursor: 'pointer',
            fontFamily: "'Figtree',sans-serif",
            transition: 'all 0.15s',
            boxShadow: activeMood === m.id ? '0 0 16px var(--accent-glow)' : 'none',
          }}
        >
          {m.label}
          {activeMood === m.id && <span style={{ marginLeft: '6px', opacity: 0.8 }}>×</span>}
        </button>
      ))}
    </div>
  );
}
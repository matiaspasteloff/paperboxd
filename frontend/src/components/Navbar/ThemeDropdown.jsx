import { useTheme } from '../../App';

const THEMES = [
  { id: 'dark-blue', label: '🌊 Azul Oscuro' },
  { id: 'dark-pure', label: '⚡ Negro Puro' },
  { id: 'sepia',     label: '📜 Sepia' },
  { id: 'light',     label: '☀️ Claro' },
];

export default function ThemeDropdown({ onClose }) {
  const { theme, setTheme } = useTheme();
  return (
    <div
      className="scaleIn"
      style={{
        position: 'fixed',
        top: '66px',
        right: '16px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border-2)',
        borderRadius: '12px',
        padding: '6px',
        minWidth: '170px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        zIndex: 300,
      }}
    >
      {THEMES.map(t => (
        <button
          key={t.id}
          onClick={() => { setTheme(t.id); onClose(); }}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: theme === t.id ? 'var(--accent-sub)' : 'transparent',
            border: theme === t.id ? '1px solid var(--border-2)' : '1px solid transparent',
            borderRadius: '8px',
            color: theme === t.id ? 'var(--accent-2)' : 'var(--text-dim)',
            fontSize: '13px',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: "'Figtree',sans-serif",
            fontWeight: theme === t.id ? '600' : '400',
            marginBottom: '2px',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
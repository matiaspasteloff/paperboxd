const ALL_GENRES = ['ficción', 'no ficción', 'fantasía', 'ciencia ficción', 'romance', 'thriller', 'historia', 'poesía', 'terror', 'autoayuda', 'ensayo', 'clásicos'];
const ALL_MOODS  = ['oscuro', 'emotivo', 'relajante', 'épico', 'misterioso', 'filosófico', 'romántico', 'humorístico'];

function Tag({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: '5px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: active ? '600' : '400', background: active ? 'var(--accent)' : 'var(--surface-3)', color: active ? '#fff' : 'var(--text-muted)', border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', fontFamily: "'Figtree',sans-serif", transition: 'all 0.15s' }}>
      {children}
    </button>
  );
}

export default function EditForm({ editForm, setEditForm, isMobile }) {
  const toggle = (key, val) => {
    const arr = editForm[key] ? editForm[key].split(',').filter(Boolean) : [];
    const idx = arr.indexOf(val);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
    setEditForm(f => ({ ...f, [key]: arr.join(',') }));
  };

  const favGenres = editForm.favorite_genres?.split(',').filter(Boolean) || [];
  const favMoods  = editForm.favorite_moods?.split(',').filter(Boolean)  || [];

  return (
    <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Bio */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '8px' }}>Bio</p>
        <textarea value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} maxLength={200} placeholder="Contá algo sobre vos..." style={{ width: '100%', minHeight: '70px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '14px', padding: '10px 13px', resize: 'none', fontFamily: "'Figtree',sans-serif", outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Location / website */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
        <input className="input-field" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} placeholder="📍 Ciudad o país" style={{ fontSize: '13px' }} />
        <input className="input-field" value={editForm.website} onChange={e => setEditForm(f => ({ ...f, website: e.target.value }))} placeholder="🔗 Website" style={{ fontSize: '13px' }} />
      </div>

      {/* Genres */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '10px' }}>Géneros favoritos</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {ALL_GENRES.map(g => <Tag key={g} active={favGenres.includes(g)} onClick={() => toggle('favorite_genres', g)}>{g}</Tag>)}
        </div>
      </div>

      {/* Moods */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '10px' }}>Moods favoritos</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {ALL_MOODS.map(m => <Tag key={m} active={favMoods.includes(m)} onClick={() => toggle('favorite_moods', m)}>{m}</Tag>)}
        </div>
      </div>
    </div>
  );
}
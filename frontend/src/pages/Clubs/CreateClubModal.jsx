import { useState } from 'react';
import { api } from '../../api';

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: '7px' }}>{label}</label>
      {children}
    </div>
  );
}

export default function CreateClubModal({ token, isMobile, onClose, onCreated }) {
  const [form,      setForm]      = useState({ name: '', description: '', open_library_work_id: '', book_title: '', cover_url: '' });
  const [searchQ,   setSearchQ]   = useState('');
  const [searchRes, setSearchRes] = useState([]);

  const searchBooks = async () => {
    if (!searchQ.trim()) return;
    const d = await api.searchBooks(searchQ).catch(() => ({ docs: [] }));
    setSearchRes((d.docs || []).slice(0, 5));
  };

  const selectBook = (book) => {
    const workId = book.key?.replace('/works/', '') || '';
    const cover  = book.cover_url || (book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : '');
    setForm(f => ({ ...f, open_library_work_id: workId, book_title: book.title, cover_url: cover }));
    setSearchRes([]);
  };

  const createClub = async () => {
    if (!form.name.trim() || !form.book_title) return;
    await api.createClub(token, form).catch(() => {});
    onCreated();
  };

  const canCreate = form.name.trim() && form.book_title;

  return (
    <div className="fadeIn" onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? '0' : '16px' }}>
      <div className="scaleIn" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: isMobile ? '20px 20px 0 0' : '18px', padding: isMobile ? '8px 18px 28px' : '30px', width: '100%', maxWidth: isMobile ? '100%' : '480px', maxHeight: '90vh', overflowY: 'auto' }}>
        {isMobile && <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--border-2)', margin: '12px auto 16px' }} />}
        <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Crear club de lectura</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
          <Field label="Nombre del club">
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Los viajeros del tiempo" />
          </Field>

          <Field label="Descripción">
            <textarea className="input-field" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="¿De qué va el club?" style={{ resize: 'vertical', minHeight: '60px' }} />
          </Field>

          <Field label="Libro a discutir">
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="input-field" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscá el libro..." onKeyDown={e => e.key === 'Enter' && searchBooks()} />
              <button onClick={searchBooks} style={{ padding: '0 14px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", fontWeight: '700', whiteSpace: 'nowrap' }}>Buscar</button>
            </div>
            {form.book_title && <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--accent-2)', fontWeight: '600' }}>✓ {form.book_title}</p>}
            {searchRes.length > 0 && (
              <div style={{ marginTop: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                {searchRes.map(b => (
                  <div key={b.key} onClick={() => selectBook(b)} style={{ padding: '9px 13px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '13px', color: 'var(--text)', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-sub)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <span style={{ fontWeight: '600' }}>{b.title}</span>
                    {b.author_name?.[0] && <span style={{ color: 'var(--text-muted)' }}> – {b.author_name[0]}</span>}
                  </div>
                ))}
              </div>
            )}
          </Field>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '12px' }}>Cancelar</button>
          <button onClick={createClub} disabled={!canCreate} style={{ flex: 1, padding: '12px', background: canCreate ? 'var(--accent)' : 'var(--surface-3)', color: canCreate ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: canCreate ? 'pointer' : 'not-allowed', fontFamily: "'Figtree',sans-serif" }}>Crear club</button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function Clubs({ user, token, onAuthClick, navigate }) {
  const { isMobile, lt } = useBreakpoint();
  const [clubs,      setClubs]     = useState([]);
  const [active,     setActive]    = useState(null);
  const [messages,   setMessages]  = useState([]);
  const [chapter,    setChapter]   = useState(1);
  const [newMsg,     setNewMsg]    = useState('');
  const [loading,    setLoading]   = useState(true);
  const [showCreate, setShowCreate]= useState(false);
  const [form,       setForm]      = useState({ name: '', description: '', open_library_work_id: '', book_title: '', cover_url: '' });
  const [searchQ,    setSearchQ]   = useState('');
  const [searchRes,  setSearchRes] = useState([]);
  const [sending,    setSending]   = useState(false);
  const [showChat,   setShowChat]  = useState(false); // mobile: show chat overlay
  const msgEnd  = useRef(null);
  const pollRef = useRef(null);
  const pad     = isMobile ? '16px' : lt(1024) ? '24px' : '32px';

  const loadClubs = async () => {
    const data = await api.getClubs().catch(() => []);
    setClubs(data); setLoading(false);
  };

  const loadMessages = async (clubId, ch) => {
    const data = await api.getMessages(clubId, ch).catch(() => []);
    setMessages(data);
    setTimeout(() => msgEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  useEffect(() => { loadClubs(); }, []);

  useEffect(() => {
    if (active) {
      loadMessages(active.id, chapter);
      pollRef.current = setInterval(() => loadMessages(active.id, chapter), 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [active, chapter]);

  const openClub = (club) => {
    setActive(club); setChapter(1);
    if (isMobile) setShowChat(true);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !token) return;
    setSending(true);
    try {
      await api.postMessage(token, active.id, { content: newMsg.trim(), chapter });
      setNewMsg('');
      await loadMessages(active.id, chapter);
    } catch {} finally { setSending(false); }
  };

  const searchBooks = async () => {
    if (!searchQ.trim()) return;
    const d = await api.searchBooks(searchQ).catch(() => ({ docs: [] }));
    setSearchRes((d.docs || []).slice(0, 5));
  };

  const selectBook = (book) => {
    const workId = book.key?.replace('/works/', '') || '';
    const cover  = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : '';
    setForm(f => ({ ...f, open_library_work_id: workId, book_title: book.title, cover_url: cover }));
    setSearchRes([]);
  };

  const createClub = async () => {
    if (!form.name.trim() || !form.book_title) return;
    await api.createClub(token, form).catch(() => {});
    setShowCreate(false); setForm({ name: '', description: '', open_library_work_id: '', book_title: '', cover_url: '' });
    loadClubs();
  };

  const hours = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  // Chat panel shared between desktop inline and mobile overlay
  const ChatPanel = () => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: isMobile ? '0' : '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: isMobile ? '100%' : 'calc(100vh - 160px)', ...(isMobile ? {} : { position: 'sticky', top: '72px' }) }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '38px', height: '54px', borderRadius: '6px', overflow: 'hidden', background: 'var(--surface-2)', flexShrink: 0 }}>
          {active?.cover_url ? <img src={active.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '16px' }}>📖</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '14px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active?.name}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active?.book_title}</p>
        </div>
        <button onClick={() => { setActive(null); setShowChat(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>×</button>
      </div>

      {/* Chapter selector */}
      <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', flexShrink: 0 }}>CAP.</span>
        <div className="tabs-scroll" style={{ gap: '3px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
            <button key={c} onClick={() => setChapter(c)} style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: chapter === c ? '700' : '400', background: chapter === c ? 'var(--accent)' : 'var(--surface-2)', color: chapter === c ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '28px' }}>💬</span>
            <p>¡Iniciá la conversación del capítulo {chapter}!</p>
          </div>
        ) : (
          messages.map(m => {
            const isMe = m.username === user?.username;
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff' }}>{m.username[0].toUpperCase()}</div>
                <div style={{ maxWidth: '78%' }}>
                  {!isMe && <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', marginLeft: '4px' }}>{m.username}</p>}
                  <div style={{ background: isMe ? 'var(--accent)' : 'var(--surface-2)', color: isMe ? '#fff' : 'var(--text)', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '9px 13px', fontSize: '14px', lineHeight: 1.5, border: isMe ? 'none' : '1px solid var(--border)' }}>{m.content}</div>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', textAlign: isMe ? 'right' : 'left', marginLeft: '4px', marginRight: '4px' }}>{hours(m.created_at)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={msgEnd} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
        {user ? (
          <>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder={`Capítulo ${chapter}...`} style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: isMobile ? '16px' : '14px', padding: '10px 13px', outline: 'none', fontFamily: "'Figtree',sans-serif" }} onFocus={e => (e.target.style.borderColor = 'var(--border-3)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            <button onClick={sendMessage} disabled={!newMsg.trim() || sending} style={{ padding: '10px 14px', background: newMsg.trim() ? 'var(--accent)' : 'var(--surface-3)', color: newMsg.trim() ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: newMsg.trim() ? 'pointer' : 'not-allowed', fontFamily: "'Figtree',sans-serif", fontSize: '16px' }}>
              {sending ? '...' : '➤'}
            </button>
          </>
        ) : (
          <button onClick={onAuthClick} style={{ width: '100%', padding: '11px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>Ingresá para participar</button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '58px' }}>
      <div style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: `${isMobile ? '28px' : '32px'} ${pad} 60px`, display: 'grid', gridTemplateColumns: active && !isMobile ? '320px 1fr' : '1fr', gap: '22px', alignItems: 'start' }}>

        {/* Clubs list */}
        <div style={{ gridColumn: active && !isMobile ? '1' : '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: isMobile ? '22px' : '28px', marginBottom: '4px' }}>Clubes de Lectura</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Discutí libros capítulo a capítulo</p>
            </div>
            {user && <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ padding: '9px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Nuevo</button>}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '84px', borderRadius: '14px' }} />)}
            </div>
          ) : clubs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--accent-sub)', border: '1px solid var(--border)', borderRadius: '18px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Sin clubes todavía</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>¡Creá el primero!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {clubs.map(club => (
                <div key={club.id} onClick={() => openClub(club)} style={{ background: active?.id === club.id && !isMobile ? 'var(--accent-sub)' : 'var(--surface)', border: `1px solid ${active?.id === club.id && !isMobile ? 'var(--border-2)' : 'var(--border)'}`, borderRadius: '14px', padding: '12px 14px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center', transition: 'all 0.15s' }}>
                  <div style={{ width: '44px', height: '62px', borderRadius: '7px', overflow: 'hidden', background: 'var(--surface-2)', flexShrink: 0, border: '1px solid var(--border)' }}>
                    {club.cover_url ? <img src={club.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '18px' }}>📖</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '14px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{club.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--accent-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>{club.book_title}</p>
                    <span className="badge" style={{ fontSize: '11px' }}>💬 {club.messages_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop chat panel */}
        {active && !isMobile && <ChatPanel />}
      </div>

      {/* Mobile full-screen chat overlay */}
      {isMobile && showChat && active && (
        <div className="fadeIn" style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'var(--bg)', paddingTop: '58px' }}>
          <ChatPanel />
        </div>
      )}

      {/* Create club modal */}
      {showCreate && (
        <div className="fadeIn" onClick={e => e.target === e.currentTarget && setShowCreate(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? '0' : '16px' }}>
          <div className="scaleIn" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: isMobile ? '20px 20px 0 0' : '18px', padding: isMobile ? '8px 18px 28px' : '30px', width: '100%', maxWidth: isMobile ? '100%' : '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            {isMobile && <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--border-2)', margin: '12px auto 16px' }} />}
            <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Crear club de lectura</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
              <Field label="Nombre del club"><input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Los viajeros del tiempo" /></Field>
              <Field label="Descripción"><textarea className="input-field" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="¿De qué va el club?" style={{ resize: 'vertical', minHeight: '60px' }} /></Field>
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
              <button onClick={() => setShowCreate(false)} className="btn-ghost" style={{ flex: 1, padding: '12px' }}>Cancelar</button>
              <button onClick={createClub} disabled={!form.name.trim() || !form.book_title} style={{ flex: 1, padding: '12px', background: form.name && form.book_title ? 'var(--accent)' : 'var(--surface-3)', color: form.name && form.book_title ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: form.name && form.book_title ? 'pointer' : 'not-allowed', fontFamily: "'Figtree',sans-serif" }}>Crear club</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: '7px' }}>{label}</label>
      {children}
    </div>
  );
}
import { useRef } from 'react';

export default function ChatPanel({ active, messages, chapter, setChapter, newMsg, setNewMsg, sendMsg, sending, user, onAuthClick, onClose, isMobile }) {
  const msgEnd = useRef(null);

  const hours = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
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
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>×</button>
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
        ) : messages.map(m => {
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
        })}
        <div ref={msgEnd} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
        {user ? (
          <>
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()} placeholder={`Capítulo ${chapter}...`} style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: isMobile ? '16px' : '14px', padding: '10px 13px', outline: 'none', fontFamily: "'Figtree',sans-serif" }} onFocus={e => (e.target.style.borderColor = 'var(--border-3)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            <button onClick={sendMsg} disabled={!newMsg.trim() || sending} style={{ padding: '10px 14px', background: newMsg.trim() ? 'var(--accent)' : 'var(--surface-3)', color: newMsg.trim() ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: newMsg.trim() ? 'pointer' : 'not-allowed', fontFamily: "'Figtree',sans-serif", fontSize: '16px' }}>
              {sending ? '...' : '➤'}
            </button>
          </>
        ) : (
          <button onClick={onAuthClick} style={{ width: '100%', padding: '11px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>Ingresá para participar</button>
        )}
      </div>
    </div>
  );
}
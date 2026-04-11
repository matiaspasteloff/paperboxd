import { useState, useEffect, useRef } from 'react';
import { api } from '../../api';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import ClubsList from './ClubsList';
import ChatPanel from './ChatPanel';
import CreateClubModal from './CreateClubModal';

export default function Clubs({ user, token, onAuthClick }) {
  const { isMobile, lt } = useBreakpoint();
  const [clubs,      setClubs]      = useState([]);
  const [active,     setActive]     = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [chapter,    setChapter]    = useState(1);
  const [newMsg,     setNewMsg]     = useState('');
  const [loading,    setLoading]    = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [sending,    setSending]    = useState(false);
  const [showChat,   setShowChat]   = useState(false);
  const pollRef = useRef(null);
  const pad = isMobile ? '16px' : lt(1024) ? '24px' : '32px';

  const loadClubs = async () => {
    const data = await api.getClubs().catch(() => []);
    setClubs(data);
    setLoading(false);
  };

  const loadMessages = async (clubId, ch) => {
    const data = await api.getMessages(clubId, ch).catch(() => []);
    setMessages(data);
  };

  useEffect(() => { loadClubs(); }, []);

  useEffect(() => {
    if (!active) return;
    loadMessages(active.id, chapter);
    pollRef.current = setInterval(() => loadMessages(active.id, chapter), 5000);
    return () => clearInterval(pollRef.current);
  }, [active, chapter]);

  const openClub = (club) => {
    setActive(club);
    setChapter(1);
    if (isMobile) setShowChat(true);
  };

  const closeChat = () => {
    setActive(null);
    setShowChat(false);
    clearInterval(pollRef.current);
  };

  const sendMsg = async () => {
    if (!newMsg.trim() || !token) return;
    setSending(true);
    try {
      await api.postMessage(token, active.id, { content: newMsg.trim(), chapter });
      setNewMsg('');
      await loadMessages(active.id, chapter);
    } catch {} finally { setSending(false); }
  };

  const handleChapterChange = (ch) => {
    setChapter(ch);
    clearInterval(pollRef.current);
  };

  const chatProps = {
    active, messages, chapter,
    setChapter: handleChapterChange,
    newMsg, setNewMsg,
    sendMsg, sending,
    user, onAuthClick,
    onClose: closeChat,
    isMobile,
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '58px' }}>
      <div style={{ flex: 1, maxWidth: '1280px', margin: '0 auto', width: '100%', padding: `${isMobile ? '28px' : '32px'} ${pad} 60px`, display: 'grid', gridTemplateColumns: active && !isMobile ? '320px 1fr' : '1fr', gap: '22px', alignItems: 'start' }}>

        {/* Left: clubs list */}
        <div style={{ gridColumn: active && !isMobile ? '1' : '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: isMobile ? '22px' : '28px', marginBottom: '4px' }}>Clubes de Lectura</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Discutí libros capítulo a capítulo</p>
            </div>
            {user && (
              <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ padding: '9px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Nuevo</button>
            )}
          </div>

          <ClubsList clubs={clubs} loading={loading} activeId={active?.id} isMobile={isMobile} onSelect={openClub} />
        </div>

        {/* Right: desktop chat panel */}
        {active && !isMobile && <ChatPanel {...chatProps} />}
      </div>

      {/* Mobile full-screen chat overlay */}
      {isMobile && showChat && active && (
        <div className="fadeIn" style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'var(--bg)', paddingTop: '58px' }}>
          <ChatPanel {...chatProps} />
        </div>
      )}

      {showCreate && (
        <CreateClubModal
          token={token}
          isMobile={isMobile}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadClubs(); }}
        />
      )}
    </div>
  );
}
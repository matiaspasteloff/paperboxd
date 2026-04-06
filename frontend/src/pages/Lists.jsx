import { useState, useEffect } from 'react';
import { api } from '../api';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function Lists({ user, token, onAuthClick, navigate }) {
    const { isMobile, lt } = useBreakpoint();
    const [lists, setLists] = useState([]);
    const [myLists, setMyLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [tab, setTab] = useState('public');
    const [toast, setToast] = useState('');
    const pad = isMobile ? '16px' : lt(1024) ? '24px' : '36px';

    const load = async () => {
        setLoading(true);
        try {
            const pub = await api.getPublicLists();
            setLists(pub);
            if (token) { const my = await api.getMyLists(token); setMyLists(my); }
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [token]);

    const createList = async () => {
        if (!newTitle.trim()) return;
        await api.createList(token, { title: newTitle.trim(), description: newDesc.trim(), is_public: isPublic });
        setShowCreate(false); setNewTitle(''); setNewDesc('');
        showToast('Lista creada'); load();
    };

    const toggleLike = async (listId) => {
        if (!token) { onAuthClick(); return; }
        await api.toggleLike(token, listId).catch(() => { });
        load();
    };

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
    const displayLists = tab === 'public' ? lists : myLists;

    return (
        <div style={{ minHeight: '100vh', paddingTop: '58px' }}>
            {toast && <div className="fadeUp" style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-2)', border: '1px solid var(--success)', borderRadius: '10px', padding: '12px 22px', color: 'var(--success)', fontSize: '14px', fontWeight: '600', zIndex: 300 }}>✓ {toast}</div>}

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: `${isMobile ? '36px' : '52px'} ${pad} 80px` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '14px' }}>
                    <div>
                        <h1 style={{ fontSize: isMobile ? '24px' : 'clamp(24px,4vw,38px)', marginBottom: '5px' }}>Listas temáticas</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Colecciones curadas por la comunidad</p>
                    </div>
                    {user && <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ padding: '10px 20px' }}>+ Nueva lista</button>}
                </div>

                {/* Tabs */}
                <div style={{ display: 'inline-flex', gap: '3px', margin: '22px 0', padding: '3px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                    {['public', 'mine'].map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', borderRadius: '9px', fontSize: '13px', fontWeight: tab === t ? '700' : '400', background: tab === t ? 'var(--accent)' : 'transparent', color: tab === t ? '#fff' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>
                            {t === 'public' ? '🌐 Públicas' : '📚 Mis listas'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '14px' }} />)}
                    </div>
                ) : displayLists.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '70px 20px', background: 'var(--accent-sub)', border: '1px solid var(--border)', borderRadius: '18px' }}>
                        <div style={{ fontSize: '44px', marginBottom: '14px' }}>📋</div>
                        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{tab === 'public' ? 'Sin listas públicas todavía' : 'No creaste ninguna lista'}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>¡Sé el primero en crear una colección temática!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {displayLists.map((list, i) => <ListCard key={list.id} list={list} index={i} onLike={() => toggleLike(list.id)} isMobile={isMobile} />)}
                    </div>
                )}
            </div>

            {/* Create modal */}
            {showCreate && (
                <div className="fadeIn" onClick={e => e.target === e.currentTarget && setShowCreate(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? '0' : '16px' }}>
                    <div className="scaleIn" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: isMobile ? '20px 20px 0 0' : '18px', padding: isMobile ? '8px 18px 28px' : '30px', width: '100%', maxWidth: isMobile ? '100%' : '440px' }}>
                        {isMobile && <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--border-2)', margin: '12px auto 16px' }} />}
                        <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Crear nueva lista</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: '7px' }}>Nombre</label>
                                <input className="input-field" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ej: Mejores novelas de terror" onKeyDown={e => e.key === 'Enter' && createList()} />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: '7px' }}>Descripción</label>
                                <textarea className="input-field" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Describí tu colección..." style={{ resize: 'vertical', minHeight: '70px', lineHeight: 1.6 }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <button onClick={() => setIsPublic(p => !p)} style={{ width: '40px', height: '22px', borderRadius: '11px', background: isPublic ? 'var(--accent)' : 'var(--surface-3)', border: isPublic ? 'none' : '1px solid var(--border)', cursor: 'pointer', position: 'relative' }}>
                                    <span style={{ position: 'absolute', top: '2px', width: '18px', height: '18px', background: '#fff', borderRadius: '50%', left: isPublic ? '20px' : '2px', transition: 'left 0.2s' }} />
                                </button>
                                <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>{isPublic ? '🌐 Pública' : '🔒 Privada'}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowCreate(false)} className="btn-ghost" style={{ flex: 1, padding: '12px' }}>Cancelar</button>
                            <button onClick={createList} disabled={!newTitle.trim()} style={{ flex: 1, padding: '12px', background: newTitle.trim() ? 'var(--accent)' : 'var(--surface-3)', color: newTitle.trim() ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: newTitle.trim() ? 'pointer' : 'not-allowed', fontFamily: "'Figtree',sans-serif", boxShadow: newTitle.trim() ? '0 0 16px var(--accent-glow)' : 'none' }}>Crear lista</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ListCard({ list, index, onLike, isMobile }) {
    const [hov, setHov] = useState(false);
    return (
        <div className="fadeUp" style={{ animationDelay: `${index * 0.05}s`, background: 'var(--surface)', border: `1px solid ${hov ? 'var(--border-2)' : 'var(--border)'}`, borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s', transform: hov ? 'translateY(-3px)' : 'translateY(0)' }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        >
            {/* Cover strip */}
            <div style={{ display: 'flex', height: '80px', overflow: 'hidden', background: 'var(--surface-2)' }}>
                {list.items.slice(0, 4).map((item, i) => (
                    <div key={i} style={{ flex: 1, overflow: 'hidden' }}>
                        {item.cover_url ? <img src={item.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📚</div>}
                    </div>
                ))}
                {list.items.length === 0 && <div style={{ flex: 1, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>📋</div>}
            </div>

            <div style={{ padding: '14px 16px' }}>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: '15px', fontWeight: '700', marginBottom: '5px', lineHeight: 1.3 }}>{list.title}</h3>
                {list.description && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{list.description}</p>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📚 {list.books_count}</span>
                        {list.owner_name && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>por <span style={{ color: 'var(--accent-2)' }}>{list.owner_name}</span></span>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onLike(); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 12px', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '100px', color: 'var(--accent-2)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>
                        ❤️ {list.likes_count}
                    </button>
                </div>
            </div>
        </div>
    );
}
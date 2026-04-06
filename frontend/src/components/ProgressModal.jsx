import { useState } from 'react';
import { api } from '../api';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function ProgressModal({ book, token, existing, onClose, onSuccess }) {
    const { isMobile } = useBreakpoint();
    const workId = book.key?.replace('/works/', '') || '';
    const coverUrl = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null;

    const [totalPages, setTotal] = useState(existing?.total_pages || 0);
    const [currentPage, setCurrent] = useState(existing?.current_page || 0);
    const [status, setStatus] = useState(existing?.status || 'reading');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const pct = totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;

    const submit = async () => {
        setLoading(true); setError('');
        try {
            const body = { open_library_work_id: workId, book_title: book.title, cover_url: coverUrl, total_pages: Number(totalPages), current_page: Number(currentPage), status };
            existing ? await api.updateProgress(token, existing.id, { current_page: Number(currentPage), total_pages: Number(totalPages), status }) : await api.addProgress(token, body);
            onSuccess();
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const STATUSES = [
        { id: 'want', label: 'Quiero leer', icon: '🔖' },
        { id: 'reading', label: 'Leyendo', icon: '📖' },
        { id: 'finished', label: 'Terminado', icon: '✅' },
    ];

    return (
        <div className="fadeIn" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? '0' : '16px' }}>
            <div className="scaleIn" style={{ background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: isMobile ? '20px 20px 0 0' : '20px', padding: isMobile ? '8px 16px 28px' : '32px', width: '100%', maxWidth: isMobile ? '100%' : '440px', position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}>

                {isMobile && <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'var(--border-2)', margin: '12px auto 16px' }} />}
                <button onClick={onClose} style={{ position: 'absolute', top: isMobile ? '16px' : '14px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer' }}>×</button>

                <h3 style={{ fontSize: '17px', marginBottom: '18px' }}>{existing ? 'Actualizar progreso' : 'Agregar a mi biblioteca'}</h3>

                {/* Book info */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '58px', borderRadius: '6px', overflow: 'hidden', background: 'var(--surface-2)', flexShrink: 0, border: '1px solid var(--border)' }}>
                        {coverUrl ? <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>📚</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '14px', fontWeight: '700', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{book.title}</p>
                        {book.author_name?.[0] && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{book.author_name[0]}</p>}
                    </div>
                </div>

                {/* Status */}
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '10px' }}>Estado</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {STATUSES.map(s => (
                            <button key={s.id} onClick={() => setStatus(s.id)} style={{ flex: 1, padding: '9px 4px', background: status === s.id ? 'var(--accent-sub)' : 'var(--surface-2)', border: `1px solid ${status === s.id ? 'var(--border-2)' : 'var(--border)'}`, borderRadius: '8px', color: status === s.id ? 'var(--accent-2)' : 'var(--text-muted)', fontSize: '12px', fontWeight: status === s.id ? '600' : '400', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '16px' }}>{s.icon}</span>
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Progress */}
                {(status === 'reading' || status === 'finished') && (
                    <div style={{ marginBottom: '20px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '12px' }}>Progreso</p>

                        <div style={{ height: '8px', background: 'var(--surface-3)', borderRadius: '4px', marginBottom: '12px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', borderRadius: '4px', boxShadow: '0 0 8px var(--accent-glow)', transition: 'width 0.3s' }} />
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '22px', fontFamily: "'Syne',sans-serif", fontWeight: '800', color: 'var(--accent)', marginBottom: '14px' }}>{pct}%</div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Página actual</label>
                                <input className="input-field" type="number" min="0" max={totalPages || 9999} value={currentPage} onChange={e => setCurrent(Math.min(e.target.value, totalPages || e.target.value))} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Total págs.</label>
                                <input className="input-field" type="number" min="1" value={totalPages} onChange={e => setTotal(e.target.value)} />
                            </div>
                        </div>

                        {/* Quick % buttons */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {[25, 50, 75, 100].map(p => (
                                <button key={p} onClick={() => totalPages > 0 && setCurrent(Math.round(totalPages * p / 100))} style={{ flex: 1, padding: '6px 0', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>{p}%</button>
                            ))}
                        </div>
                    </div>
                )}

                {error && <p style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-ghost" onClick={onClose} style={{ padding: '12px 16px' }}>Cancelar</button>
                    <button onClick={submit} disabled={loading} style={{ flex: 1, padding: '13px', background: loading ? 'var(--surface-3)' : 'var(--accent)', color: loading ? 'var(--text-muted)' : '#fff', fontWeight: '700', fontSize: '15px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Figtree',sans-serif", boxShadow: loading ? 'none' : '0 0 16px var(--accent-glow)' }}>
                        {loading ? 'Guardando...' : existing ? 'Actualizar' : 'Agregar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
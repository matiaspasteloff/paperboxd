import { useState, useEffect } from 'react';
import { api } from '../api';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';
import ProgressModal from '../components/ProgressModal';

export default function BookDetail({ book, user, token, onAuthClick, navigate }) {
    const [reviews, setReviews] = useState([]);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReview, setShowReview] = useState(false);
    const [showProg, setShowProg] = useState(false);
    const [showDNF, setShowDNF] = useState(false);
    const [dnfReason, setDnfReason] = useState('');
    const [toast, setToast] = useState('');

    const workId = book.key?.replace('/works/', '') || '';
    const coverUrl = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null;

    const loadReviews = async () => {
        setLoading(true);
        try {
            const data = await api.getBookReviews(workId);
            setReviews(data);
            if (token) {
                const prog = await api.getProgress(token);
                setProgress(prog.find(p => p.open_library_work_id === workId) || null);
            }
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { loadReviews(); }, [workId]);

    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
    const ratingDist = [5, 4, 3, 2, 1].map(s => ({ s, c: reviews.filter(r => Math.round(r.rating) === s).length }));
    const maxC = Math.max(...ratingDist.map(d => d.c), 1);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const addDNF = async () => {
        if (!token) { onAuthClick(); return; }
        await api.addDNF(token, { open_library_work_id: workId, book_title: book.title, cover_url: coverUrl, reason: dnfReason.trim() || null }).catch(() => { });
        setShowDNF(false); showToast('Libro marcado como DNF');
    };

    const moodColors = { oscuro: '#3d3d80', emotivo: '#803d6a', relajante: '#3d804a', épico: '#80623d', misterioso: '#3d5280', romántico: '#80463d', filosófico: '#5d3d80', humorístico: '#7a7a3d' };

    return (
        <div style={{ minHeight: '100vh', paddingTop: '58px' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            {toast && <div className="fadeUp" style={{ position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-2)', border: '1px solid var(--success)', borderRadius: '10px', padding: '12px 22px', color: 'var(--success)', fontSize: '14px', fontWeight: '600', zIndex: 300, whiteSpace: 'nowrap' }}>✓ {toast}</div>}

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 32px 0' }}>
                <button onClick={() => navigate('home')} className="btn-ghost" style={{ padding: '7px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>← Volver</button>
            </div>

            {/* ─── BOOK HEADER ─── */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px', display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ width: '180px', height: '265px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, background: 'var(--surface-2)', border: '1px solid var(--border)', boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }}>
                    {coverUrl ? <img src={coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>📚</div>}
                </div>

                <div style={{ flex: 1, minWidth: '260px' }}>
                    <h1 className="fadeUp" style={{ fontSize: 'clamp(24px,4vw,38px)', lineHeight: 1.15, marginBottom: '10px' }}>{book.title}</h1>
                    {book.author_name?.[0] && <p className="fadeUp" style={{ color: 'var(--text-dim)', fontSize: '16px', marginBottom: '6px', animationDelay: '0.05s' }}>por <span style={{ color: 'var(--accent-2)' }}>{book.author_name[0]}</span></p>}
                    {book.first_publish_year && <p className="fadeUp" style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '22px', animationDelay: '0.1s' }}>Primera edición: {book.first_publish_year}</p>}

                    {/* Rating summary */}
                    {avgRating && (
                        <div className="fadeUp" style={{ animationDelay: '0.12s', display: 'inline-flex', gap: '18px', alignItems: 'center', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '14px', padding: '16px 22px', marginBottom: '22px' }}>
                            <div>
                                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '38px', fontWeight: 800, lineHeight: 1 }}>{avgRating}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{reviews.length} reseñas</div>
                            </div>
                            <div>
                                <StarRating value={Math.round(parseFloat(avgRating))} size="lg" />
                                {ratingDist.map(({ s, c }) => (
                                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '10px' }}>{s}</span>
                                        <span style={{ color: 'var(--star)', fontSize: '10px' }}>★</span>
                                        <div style={{ width: '80px', height: '4px', background: 'var(--surface-3)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${(c / maxC) * 100}%`, background: 'var(--accent)', borderRadius: '2px' }} />
                                        </div>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="fadeUp" style={{ animationDelay: '0.2s', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Progress */}
                        {user && (
                            <button onClick={() => setShowProg(true)} style={{
                                padding: '11px 20px', background: progress ? 'var(--accent-sub)' : 'var(--accent)',
                                color: progress ? 'var(--accent-2)' : '#fff',
                                border: progress ? '1px solid var(--border-2)' : 'none',
                                borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                                cursor: 'pointer', fontFamily: "'Figtree',sans-serif",
                                boxShadow: progress ? 'none' : '0 0 16px var(--accent-glow)',
                            }}>
                                {progress ? `📖 ${Math.round((progress.current_page / Math.max(progress.total_pages, 1)) * 100)}% leído` : '📖 Agregar a biblioteca'}
                            </button>
                        )}
                        {/* Review */}
                        <button onClick={() => user ? setShowReview(true) : onAuthClick()} style={{ padding: '11px 20px', background: 'var(--surface)', border: '1px solid var(--border-2)', borderRadius: '10px', fontSize: '14px', fontWeight: '700', color: 'var(--text)', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", transition: 'all 0.15s' }} onMouseEnter={e => { e.target.style.borderColor = 'var(--border-3)'; e.target.style.background = 'var(--surface-2)'; }} onMouseLeave={e => { e.target.style.borderColor = 'var(--border-2)'; e.target.style.background = 'var(--surface)'; }}>
                            ✍️ {user ? 'Reseñar' : 'Ingresá para reseñar'}
                        </button>
                        {/* DNF */}
                        {user && (
                            <button onClick={() => setShowDNF(true)} style={{ padding: '11px 16px', background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: 'var(--danger)', cursor: 'pointer', fontFamily: "'Figtree',sans-serif", transition: 'all 0.15s' }} onMouseEnter={e => { e.target.style.background = 'rgba(248,81,73,0.15)'; }} onMouseLeave={e => { e.target.style.background = 'rgba(248,81,73,0.08)'; }}>
                                🚫 DNF
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── REVIEWS ─── */}
            <div style={{ borderTop: '1px solid var(--border)', maxWidth: '1100px', margin: '0 auto', padding: '40px 32px 80px' }}>
                <h2 style={{ fontSize: '22px', marginBottom: '28px' }}>
                    Reseñas de la comunidad
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400, fontFamily: "'Figtree',sans-serif", marginLeft: '10px' }}>({reviews.length})</span>
                </h2>

                {loading ? (
                    <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', padding: '20px 0' }}>
                        <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid var(--border-2)', borderTop: `2px solid var(--accent)`, borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
                        Cargando reseñas...
                    </div>
                ) : reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'var(--accent-sub)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✍️</div>
                        <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>Nadie reseñó este libro todavía. ¡Sé el primero!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {reviews.map((r, i) => (
                            <div key={r.id} className="fadeUp" style={{ animationDelay: `${i * 0.05}s`, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 24px', transition: 'border-color 0.2s' }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: '#fff', fontFamily: "'Syne',sans-serif", border: '2px solid var(--border-2)' }}>{r.username[0].toUpperCase()}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '15px', fontFamily: "'Syne',sans-serif" }}>{r.username}</span>
                                            <StarRating value={r.rating} size="sm" />
                                            <span style={{ padding: '2px 10px', background: 'var(--accent-sub)', border: '1px solid var(--border-2)', borderRadius: '100px', fontSize: '11px', color: 'var(--accent-2)', fontWeight: '600' }}>{r.rating}/5</span>
                                            {r.created_at && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(r.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                        </div>
                                        {r.review_text && <p style={{ color: 'var(--text-dim)', fontSize: '14px', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '10px' }}>"{r.review_text}"</p>}
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {r.mood_tags?.split(',').filter(Boolean).map(m => <span key={m} style={{ fontSize: '11px', padding: '2px 8px', background: moodColors[m] ? moodColors[m] + '30' : 'var(--surface-3)', color: moodColors[m] || 'var(--text-muted)', border: `1px solid ${moodColors[m] ? moodColors[m] + '60' : 'var(--border)'}`, borderRadius: '100px' }}>{m}</span>)}
                                            {r.pace_tag && <span style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--surface-3)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '100px' }}>⚡ {r.pace_tag}</span>}
                                            {r.genre && <span style={{ fontSize: '11px', padding: '2px 8px', background: 'var(--surface-3)', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '100px' }}>📚 {r.genre}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showReview && token && <ReviewModal book={book} token={token} onClose={() => setShowReview(false)} onSuccess={() => { setShowReview(false); showToast('Reseña guardada ✓'); loadReviews(); }} />}
            {showProg && token && <ProgressModal book={book} token={token} existing={progress} onClose={() => setShowProg(false)} onSuccess={() => { setShowProg(false); showToast('Progreso actualizado ✓'); loadReviews(); }} />}

            {showDNF && (
                <div className="fadeIn" onClick={e => e.target === e.currentTarget && setShowDNF(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div className="scaleIn" style={{ background: 'var(--surface)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px' }}>
                        <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>🚫 Marcar como DNF</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Este libro no afectará tus estadísticas ni tu reto anual.</p>
                        <textarea value={dnfReason} onChange={e => setDnfReason(e.target.value)} placeholder="¿Por qué lo abandonaste? (opcional)" style={{ width: '100%', minHeight: '80px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '14px', padding: '11px 14px', resize: 'vertical', fontFamily: "'Figtree',sans-serif", outline: 'none', marginBottom: '16px' }} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowDNF(false)} className="btn-ghost" style={{ flex: 1, padding: '11px' }}>Cancelar</button>
                            <button onClick={addDNF} style={{ flex: 1, padding: '11px', background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Figtree',sans-serif" }}>Confirmar DNF</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const moodColors = { oscuro: '#3d3d80', emotivo: '#803d6a', relajante: '#3d804a', épico: '#80623d', misterioso: '#3d5280', romántico: '#80463d', filosófico: '#5d3d80', humorístico: '#7a7a3d' };
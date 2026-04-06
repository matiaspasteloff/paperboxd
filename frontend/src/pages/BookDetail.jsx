import { useState, useEffect } from 'react';
import { api } from '../api';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';

function Avatar({ name }) {
    const colors = ['#388bfd', '#1a6bcc', '#58a6ff', '#2563eb', '#1d4ed8'];
    const idx = name.charCodeAt(0) % colors.length;
    return (
        <div style={{
            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
            background: colors[idx], display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', fontWeight: '700', color: '#fff',
            fontFamily: "'Syne', sans-serif",
            border: '2px solid rgba(56,139,253,0.2)',
        }}>
            {name[0].toUpperCase()}
        </div>
    );
}

export default function BookDetail({ book, user, token, onAuthClick, navigate }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState('');

    const workId = book.key?.replace('/works/', '') || '';
    const coverUrl = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
        : null;

    const loadReviews = async () => {
        if (!workId) return;
        setLoading(true);
        try {
            const data = await api.getBookReviews(workId);
            setReviews(data);
        } catch { setReviews([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadReviews(); }, [workId]);

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => Math.round(r.rating) === star).length,
    }));
    const maxCount = Math.max(...ratingDist.map((d) => d.count), 1);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3200); };

    const handleReview = () => {
        if (!user) { onAuthClick(); return; }
        setShowModal(true);
    };

    return (
        <div style={{ minHeight: '100vh', paddingTop: '58px' }}>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #0d2038, #112546)',
                    border: '1px solid rgba(63,185,80,0.35)', borderRadius: '10px',
                    padding: '12px 22px', color: '#3fb950', fontSize: '14px', fontWeight: '600',
                    zIndex: 300, animation: 'fadeUp 0.3s ease both',
                    boxShadow: '0 0 20px rgba(63,185,80,0.15)',
                }}>✓ {toast}</div>
            )}

            {/* Back */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 32px 0' }}>
                <button
                    onClick={() => navigate('home')}
                    style={{
                        background: 'transparent', border: '1px solid rgba(56,139,253,0.15)',
                        borderRadius: '8px', padding: '7px 14px',
                        color: '#7fafd4', fontSize: '13px', cursor: 'pointer',
                        fontFamily: "'Figtree', sans-serif", transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56,139,253,0.3)'; e.currentTarget.style.color = '#ddeeff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(56,139,253,0.15)'; e.currentTarget.style.color = '#7fafd4'; }}
                >
                    ← Volver
                </button>
            </div>

            {/* ─── BOOK HEADER ─── */}
            <div style={{
                maxWidth: '1100px', margin: '0 auto',
                padding: '36px 32px 48px',
                display: 'flex', gap: '40px', alignItems: 'flex-start',
                flexWrap: 'wrap',
            }}>
                {/* Cover */}
                <div style={{
                    width: '180px', height: '265px', borderRadius: '12px',
                    overflow: 'hidden', flexShrink: 0,
                    background: 'linear-gradient(135deg, #091828, #0d2038)',
                    border: '1px solid rgba(56,139,253,0.15)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 40px rgba(56,139,253,0.08)',
                }}>
                    {coverUrl
                        ? <img src={coverUrl} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px' }}>📚</div>
                    }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: '260px' }}>
                    <div className="fadeUp" style={{ animationDelay: '0.05s' }}>
                        <h1 style={{ fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: 1.1, marginBottom: '10px' }}>
                            {book.title}
                        </h1>
                        {book.author_name?.[0] && (
                            <p style={{ color: '#7fafd4', fontSize: '17px', marginBottom: '6px' }}>
                                por <span style={{ color: '#58a6ff' }}>{book.author_name[0]}</span>
                            </p>
                        )}
                        {book.first_publish_year && (
                            <p style={{ color: '#3d6080', fontSize: '14px', marginBottom: '24px' }}>
                                Primera edición: {book.first_publish_year}
                            </p>
                        )}
                    </div>

                    {/* Rating summary */}
                    {avgRating ? (
                        <div className="fadeUp" style={{
                            animationDelay: '0.12s',
                            display: 'inline-flex', alignItems: 'center', gap: '16px',
                            background: 'rgba(56,139,253,0.07)',
                            border: '1px solid rgba(56,139,253,0.16)',
                            borderRadius: '12px', padding: '16px 22px',
                            marginBottom: '24px',
                        }}>
                            <div>
                                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '42px', fontWeight: 800, color: '#ddeeff', lineHeight: 1 }}>
                                    {avgRating}
                                </div>
                                <div style={{ color: '#3d6080', fontSize: '12px', marginTop: '2px' }}>de 5 estrellas</div>
                            </div>
                            <div>
                                <StarRating value={Math.round(parseFloat(avgRating))} size="lg" />
                                <div style={{ color: '#3d6080', fontSize: '12px', marginTop: '4px' }}>
                                    {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
                                </div>
                            </div>
                        </div>
                    ) : !loading && (
                        <div style={{ color: '#3d6080', fontSize: '14px', marginBottom: '24px' }}>
                            Aún no hay reseñas para este libro.
                        </div>
                    )}

                    {/* Rating distribution */}
                    {reviews.length > 0 && (
                        <div className="fadeUp" style={{ animationDelay: '0.2s', marginBottom: '28px' }}>
                            {ratingDist.map(({ star, count }) => (
                                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                    <span style={{ fontSize: '12px', color: '#3d6080', width: '14px', textAlign: 'right' }}>{star}</span>
                                    <span style={{ color: '#e3b341', fontSize: '12px' }}>★</span>
                                    <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: '#0d2038', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: '3px',
                                            background: 'linear-gradient(90deg, #388bfd, #58a6ff)',
                                            width: `${(count / maxCount) * 100}%`,
                                            transition: 'width 0.5s ease',
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#3d6080', width: '20px' }}>{count}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    <button
                        onClick={handleReview}
                        className="fadeUp"
                        style={{
                            animationDelay: '0.25s',
                            background: 'linear-gradient(135deg, #388bfd, #1a6bcc)',
                            color: '#fff', fontWeight: '700', fontSize: '15px',
                            padding: '13px 30px', borderRadius: '10px', border: 'none',
                            cursor: 'pointer', fontFamily: "'Figtree', sans-serif",
                            boxShadow: '0 0 20px rgba(56,139,253,0.3)',
                            transition: 'all 0.18s',
                        }}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 0 30px rgba(56,139,253,0.4)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 0 20px rgba(56,139,253,0.3)'; }}
                    >
                        {user ? '✍️ Escribir mi reseña' : '🔒 Ingresá para reseñar'}
                    </button>
                </div>
            </div>

            {/* ─── DIVIDER ─── */}
            <div style={{ borderTop: '1px solid rgba(56,139,253,0.08)', maxWidth: '1100px', margin: '0 auto 48px', padding: '0 32px' }} />

            {/* ─── REVIEWS ─── */}
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px 80px' }}>
                <h2 style={{ fontSize: '22px', marginBottom: '28px' }}>
                    Reseñas de la comunidad
                    {reviews.length > 0 && (
                        <span style={{
                            marginLeft: '12px', fontSize: '14px', fontWeight: 400,
                            color: '#3d6080', fontFamily: "'Figtree', sans-serif",
                        }}>
                            ({reviews.length})
                        </span>
                    )}
                </h2>

                {loading ? (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#3d6080', padding: '20px 0' }}>
                        <span style={{
                            display: 'inline-block', width: '18px', height: '18px',
                            border: '2px solid rgba(56,139,253,0.3)', borderTop: '2px solid #388bfd',
                            borderRadius: '50%', animation: 'spin 0.75s linear infinite',
                        }} />
                        Cargando reseñas...
                    </div>
                ) : reviews.length === 0 ? (
                    <div style={{
                        background: 'rgba(56,139,253,0.04)', border: '1px solid rgba(56,139,253,0.1)',
                        borderRadius: '14px', padding: '48px', textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '14px' }}>✍️</div>
                        <p style={{ color: '#7fafd4', fontSize: '16px', marginBottom: '6px' }}>Nadie reseñó este libro todavía</p>
                        <p style={{ color: '#3d6080', fontSize: '14px' }}>¡Sé el primero en compartir tu opinión!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {reviews.map((review, i) => (
                            <ReviewCard key={review.id} review={review} index={i} />
                        ))}
                    </div>
                )}
            </div>

            {/* Review modal */}
            {showModal && token && (
                <ReviewModal
                    book={book}
                    token={token}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); showToast('Reseña guardada'); loadReviews(); }}
                />
            )}
        </div>
    );
}

function ReviewCard({ review, index }) {
    const [hov, setHov] = useState(false);

    const date = new Date(review.id * 100000).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });

    return (
        <div
            className="fadeUp"
            style={{
                animationDelay: `${index * 0.06}s`,
                background: hov
                    ? 'linear-gradient(160deg, #091828 0%, #0d2038 100%)'
                    : 'linear-gradient(160deg, #06111f 0%, #091828 100%)',
                border: `1px solid ${hov ? 'rgba(56,139,253,0.22)' : 'rgba(56,139,253,0.1)'}`,
                borderRadius: '14px', padding: '22px 24px',
                transition: 'all 0.2s',
            }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <Avatar name={review.username} />
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '700', fontSize: '15px', color: '#ddeeff', fontFamily: "'Syne', sans-serif" }}>
                            {review.username}
                        </span>
                        <StarRating value={review.rating} size="sm" />
                        <span style={{
                            background: 'rgba(56,139,253,0.1)', border: '1px solid rgba(56,139,253,0.18)',
                            borderRadius: '100px', padding: '2px 10px',
                            fontSize: '11px', color: '#388bfd', fontWeight: '600',
                        }}>
                            {review.rating}/5
                        </span>
                    </div>
                    {review.review_text ? (
                        <p style={{ color: '#7fafd4', fontSize: '14px', lineHeight: 1.65, fontStyle: 'italic' }}>
                            "{review.review_text}"
                        </p>
                    ) : (
                        <p style={{ color: '#1e3a52', fontSize: '13px' }}>Sin reseña escrita</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function useState2(init) { return useState(init); }
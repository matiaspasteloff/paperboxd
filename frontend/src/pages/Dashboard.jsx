import { useState, useEffect } from 'react';
import { api } from '../api';
import StarRating from '../components/StarRating';

export default function Dashboard({ user, token, navigate }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) return;
        api.getMyReviews(token)
            .then(setReviews)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    const avg = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div style={{ minHeight: '100vh', paddingTop: '58px' }}>

            {/* Header */}
            <div style={{
                maxWidth: '1200px', margin: '0 auto',
                padding: '52px 36px 40px',
                borderBottom: '1px solid rgba(56,139,253,0.08)',
            }}>
                <p style={{ fontSize: '12px', color: '#3d6080', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: '600' }}>
                    Mi Perfil
                </p>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)' }}>
                        Biblioteca de{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #388bfd, #79bbff)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>{user?.username}</span>
                    </h1>

                    {!loading && reviews.length > 0 && (
                        <div style={{ display: 'flex', gap: '20px' }}>
                            {[
                                { label: 'Libros reseñados', value: reviews.length },
                                { label: 'Rating promedio', value: avg ? `${avg} ★` : '—' },
                            ].map(({ label, value }) => (
                                <div key={label} style={{
                                    textAlign: 'center',
                                    background: 'rgba(56,139,253,0.07)',
                                    border: '1px solid rgba(56,139,253,0.15)',
                                    borderRadius: '12px', padding: '14px 22px',
                                }}>
                                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 800, color: '#ddeeff' }}>
                                        {value}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#3d6080', marginTop: '2px' }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Grid */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 36px 80px' }}>
                {loading ? (
                    <LoadingGrid />
                ) : error ? (
                    <div style={{ color: '#f85149', padding: '40px', textAlign: 'center' }}>{error}</div>
                ) : reviews.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '22px' }}>
                            {reviews.map((review, i) => (
                                <ReviewCard key={review.id} review={review} index={i} navigate={navigate} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function ReviewCard({ review, index, navigate }) {
    const [hov, setHov] = useState(false);

    const handleClick = () => {
        // Reconstruct minimal book object to navigate to detail
        navigate('book', {
            key: `/works/${review.open_library_work_id}`,
            title: review.book.title,
            cover_i: review.book.cover_url
                ? review.book.cover_url.match(/\/b\/id\/(\d+)/)?.[1]
                : null,
        });
    };

    return (
        <div
            className="fadeUp"
            onClick={handleClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                animationDelay: `${index * 0.055}s`,
                background: hov
                    ? 'linear-gradient(160deg, #091828 0%, #0d2038 100%)'
                    : 'linear-gradient(160deg, #06111f 0%, #091828 100%)',
                border: `1px solid ${hov ? 'rgba(56,139,253,0.28)' : 'rgba(56,139,253,0.1)'}`,
                borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
                transform: hov ? 'translateY(-5px)' : 'translateY(0)',
                transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)',
                boxShadow: hov ? '0 14px 40px rgba(0,0,0,0.5), 0 0 20px rgba(56,139,253,0.06)' : '0 2px 8px rgba(0,0,0,0.3)',
            }}
        >
            {/* Cover */}
            <div style={{ position: 'relative', paddingTop: '145%', background: '#091828', overflow: 'hidden' }}>
                {review.book.cover_url ? (
                    <img
                        src={review.book.cover_url}
                        alt={review.book.title}
                        loading="lazy"
                        style={{
                            position: 'absolute', inset: 0, width: '100%', height: '100%',
                            objectFit: 'cover',
                            transform: hov ? 'scale(1.04)' : 'scale(1)',
                            transition: 'transform 0.3s',
                        }}
                    />
                ) : (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(135deg, #091828, #112546)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px',
                    }}>📖</div>
                )}

                {/* Rating badge */}
                <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(3,11,22,0.85)', backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(56,139,253,0.2)',
                    borderRadius: '8px', padding: '4px 9px',
                    fontSize: '12px', fontWeight: '700',
                    color: '#e3b341', display: 'flex', alignItems: 'center', gap: '3px',
                }}>
                    ★ {review.rating}
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '14px' }}>
                <p style={{
                    fontFamily: "'Syne', sans-serif", fontSize: '13px', fontWeight: '700',
                    color: '#ddeeff', lineHeight: 1.3, marginBottom: '8px',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{review.book.title}</p>

                <StarRating value={review.rating} size="sm" />

                {review.review_text && (
                    <p style={{
                        marginTop: '10px', fontSize: '12px', color: '#7fafd4',
                        lineHeight: 1.55, fontStyle: 'italic',
                        borderTop: '1px solid rgba(56,139,253,0.08)', paddingTop: '10px',
                        display: '-webkit-box', WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>"{review.review_text}"</p>
                )}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: 'rgba(56,139,253,0.04)', border: '1px solid rgba(56,139,253,0.1)',
            borderRadius: '20px',
        }}>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>📚</div>
            <h2 style={{ fontSize: '22px', marginBottom: '10px' }}>Tu biblioteca está vacía</h2>
            <p style={{ color: '#3d6080', fontSize: '15px' }}>
                Buscá un libro y escribí tu primera reseña.
            </p>
        </div>
    );
}

function LoadingGrid() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '22px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ borderRadius: '14px', overflow: 'hidden' }}>
                    <div className="skeleton" style={{ paddingTop: '145%' }} />
                    <div style={{ padding: '14px', background: '#06111f' }}>
                        <div className="skeleton" style={{ height: '14px', marginBottom: '8px', borderRadius: '4px' }} />
                        <div className="skeleton" style={{ height: '12px', width: '60%', borderRadius: '4px' }} />
                    </div>
                </div>
            ))}
        </div>
    );
}
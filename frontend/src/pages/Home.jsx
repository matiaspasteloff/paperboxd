import { useState, useCallback, useRef } from 'react';
import { api } from '../api';
import BookCard from '../components/BookCard';
import ReviewModal from '../components/ReviewModal';

export default function Home({ user, token, onAuthClick, navigate }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selected, setSelected] = useState(null);
    const [toast, setToast] = useState('');
    const resultsRef = useRef(null);

    const search = useCallback(async () => {
        if (!query.trim()) return;
        setLoading(true); setSearched(true); setResults([]);
        try {
            const data = await api.searchBooks(query.trim());
            setResults(data.docs || []);
            setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
        } catch { setResults([]); }
        finally { setLoading(false); }
    }, [query]);

    const handleRate = (book) => {
        if (!user) { onAuthClick(); return; }
        setSelected(book);
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3200);
    };

    return (
        <div style={{ minHeight: '100vh' }}>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #0d2038, #112546)',
                    border: '1px solid rgba(63,185,80,0.35)',
                    borderRadius: '10px', padding: '12px 22px',
                    color: '#3fb950', fontSize: '14px', fontWeight: '600',
                    zIndex: 300, animation: 'fadeUp 0.3s ease both',
                    boxShadow: '0 0 20px rgba(63,185,80,0.15)',
                }}>✓ {toast}</div>
            )}

            {/* ─── HERO ─── */}
            <section style={{
                minHeight: '100vh',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '0 20px',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Background effects */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: `
            radial-gradient(ellipse 70% 50% at 50% 20%, rgba(56,139,253,0.09) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 20% 80%, rgba(26,95,184,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 70%, rgba(56,139,253,0.04) 0%, transparent 60%)
          `,
                }} />
                {/* Grid */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: `
            linear-gradient(rgba(56,139,253,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,139,253,0.03) 1px, transparent 1px)
          `,
                    backgroundSize: '48px 48px',
                    maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
                }} />

                {/* Badge */}
                <div className="fadeUp" style={{
                    animationDelay: '0.05s',
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    background: 'rgba(56,139,253,0.08)',
                    border: '1px solid rgba(56,139,253,0.2)',
                    borderRadius: '100px', padding: '5px 16px',
                    fontSize: '12px', color: '#58a6ff', fontWeight: '500',
                    letterSpacing: '0.4px', marginBottom: '28px',
                }}>
                    <span>✦</span> Tu diario de lectura personal
                </div>

                {/* Title */}
                <h1 className="fadeUp" style={{
                    animationDelay: '0.15s',
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 'clamp(48px, 9vw, 100px)',
                    fontWeight: 800,
                    letterSpacing: '-2px', lineHeight: 0.95,
                    marginBottom: '22px', color: '#ddeeff',
                }}>
                    Los libros
                    <br />
                    <span style={{
                        background: 'linear-gradient(135deg, #388bfd 0%, #79bbff 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        que te forman
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="fadeUp" style={{
                    animationDelay: '0.25s',
                    fontSize: '17px', color: '#3d6080',
                    maxWidth: '420px', lineHeight: 1.7, marginBottom: '44px',
                }}>
                    Registrá lo que leíste, calificá, reseñá y descubrí qué opinan otros lectores.
                </p>

                {/* Search bar */}
                <div className="fadeUp" style={{ animationDelay: '0.35s', width: '100%', maxWidth: '540px' }}>
                    <div style={{
                        display: 'flex',
                        background: 'linear-gradient(135deg, #06111f, #091828)',
                        border: '1px solid rgba(56,139,253,0.18)',
                        borderRadius: '14px', overflow: 'hidden',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,139,253,0.05)',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                        onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(56,139,253,0.4)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(56,139,253,0.1)'; }}
                        onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(56,139,253,0.18)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,139,253,0.05)'; }}
                    >
                        <span style={{ padding: '0 0 0 18px', display: 'flex', alignItems: 'center', color: '#3d6080', fontSize: '16px' }}>🔍</span>
                        <input
                            style={{
                                flex: 1, background: 'transparent', border: 'none',
                                color: '#ddeeff', fontSize: '15px', padding: '16px 14px',
                                outline: 'none', fontFamily: "'Figtree', sans-serif",
                            }}
                            placeholder="Buscá un título, autor o ISBN..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && search()}
                        />
                        <button
                            onClick={search}
                            style={{
                                background: 'linear-gradient(135deg, #388bfd, #1a6bcc)',
                                border: 'none', color: '#fff',
                                fontWeight: '700', fontSize: '14px',
                                padding: '0 24px', cursor: 'pointer',
                                fontFamily: "'Figtree', sans-serif",
                                transition: 'background 0.18s',
                                borderLeft: '1px solid rgba(56,139,253,0.2)',
                            }}
                            onMouseEnter={e => (e.target.style.background = 'linear-gradient(135deg, #58a6ff, #388bfd)')}
                            onMouseLeave={e => (e.target.style.background = 'linear-gradient(135deg, #388bfd, #1a6bcc)')}
                        >
                            Buscar
                        </button>
                    </div>

                    {!user && results.length > 0 && (
                        <p style={{ marginTop: '12px', color: '#3d6080', fontSize: '13px' }}>
                            <span
                                onClick={onAuthClick}
                                style={{ color: '#388bfd', cursor: 'pointer', fontWeight: '600' }}
                            >Ingresá</span> para poder reseñar libros
                        </p>
                    )}
                </div>

                {/* Scroll hint */}
                {!searched && (
                    <div style={{
                        position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    }}>
                        <div style={{ width: '1px', height: '36px', background: 'linear-gradient(to bottom, #388bfd, transparent)', animation: 'pulse 2s ease infinite' }} />
                    </div>
                )}
            </section>

            {/* ─── RESULTS ─── */}
            {searched && (
                <section ref={resultsRef} style={{ padding: '60px 40px 80px', maxWidth: '1320px', margin: '0 auto', width: '100%' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', gap: '12px', color: '#3d6080' }}>
                            <span style={{
                                display: 'inline-block', width: '20px', height: '20px',
                                border: '2px solid rgba(56,139,253,0.3)', borderTop: '2px solid #388bfd',
                                borderRadius: '50%', animation: 'spin 0.75s linear infinite',
                            }} />
                            Buscando libros...
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '22px' }}>Resultados</h2>
                                <span style={{
                                    background: 'rgba(56,139,253,0.1)', border: '1px solid rgba(56,139,253,0.2)',
                                    color: '#388bfd', fontSize: '12px', fontWeight: '600',
                                    padding: '3px 10px', borderRadius: '100px',
                                }}>{results.length}</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(158px, 1fr))', gap: '18px' }}>
                                {results.map((book, i) => (
                                    <div key={book.key || i} className="fadeUp" style={{ animationDelay: `${i * 0.035}s` }}>
                                        <BookCard
                                            book={book}
                                            onRate={handleRate}
                                            onNavigate={(b) => navigate('book', b)}
                                            loggedIn={!!user}
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                            <div style={{ fontSize: '52px', marginBottom: '18px' }}>🔍</div>
                            <p style={{ color: '#7fafd4', fontSize: '17px', marginBottom: '6px' }}>Sin resultados para <em>"{query}"</em></p>
                            <p style={{ color: '#1e3a52', fontSize: '14px' }}>Probá con otro término de búsqueda</p>
                        </div>
                    )}
                </section>
            )}

            {selected && token && (
                <ReviewModal
                    book={selected}
                    token={token}
                    onClose={() => setSelected(null)}
                    onSuccess={() => { setSelected(null); showToast('Reseña guardada correctamente'); }}
                />
            )}
        </div>
    );
}
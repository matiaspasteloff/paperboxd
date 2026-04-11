// frontend/src/components/BuyBookLinks.jsx
// Integración con librerías y Amazon (affiliate)
// Coloca tu tag de Amazon en AMAZON_TAG y el de Libro en LIBRO_TAG

const AMAZON_TAG = 'paperboxd-21';   // ← reemplazá con tu Associate Tag
const LIBRO_TAG = 'paperboxd';      // ← id de afiliado de libro.net (si aplica)

// ── URL builders ─────────────────────────────────────────────────────────────

function buildAmazonUrl(title, author, isbn) {
    if (isbn) {
        return `https://www.amazon.com/dp/${isbn}?tag=${AMAZON_TAG}`;
    }
    const q = encodeURIComponent(`${title}${author ? ' ' + author : ''}`);
    return `https://www.amazon.com/s?k=${q}&i=stripbooks&tag=${AMAZON_TAG}`;
}

function buildMercadoLibreUrl(title, author) {
    const q = encodeURIComponent(`libro ${title}${author ? ' ' + author : ''}`);
    return `https://www.mercadolibre.com.ar/search?q=${q}`;
}

function buildCasaDelLibroUrl(title, author) {
    const q = encodeURIComponent(`${title}${author ? ' ' + author : ''}`);
    return `https://www.casadellibro.com/busqueda-generica?q=${q}`;
}

function buildGoogleBooksUrl(googleBooksId) {
    if (googleBooksId) {
        return `https://play.google.com/store/books/details?id=${googleBooksId}`;
    }
    return null;
}

function buildLibraryUrl(title, author) {
    // WorldCat para encontrar en biblioteca local
    const q = encodeURIComponent(`${title}${author ? ' ' + author : ''}`);
    return `https://www.worldcat.org/search?q=${q}`;
}

// ── Store button ──────────────────────────────────────────────────────────────
function StoreButton({ href, icon, label, sublabel, accent, featured = false }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: featured ? '12px 16px' : '10px 14px',
                background: featured ? accent + '14' : 'var(--surface-2)',
                border: `1px solid ${featured ? accent + '50' : 'var(--border)'}`,
                borderRadius: '10px',
                textDecoration: 'none',
                transition: 'all 0.18s',
                flex: 1,
                minWidth: '0',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = featured ? accent + '22' : 'var(--surface-3)';
                e.currentTarget.style.borderColor = featured ? accent + '80' : 'var(--border-2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = featured ? accent + '14' : 'var(--surface-2)';
                e.currentTarget.style.borderColor = featured ? accent + '50' : 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <span style={{ fontSize: featured ? '22px' : '18px', flexShrink: 0 }}>{icon}</span>
            <div style={{ minWidth: 0 }}>
                <p style={{
                    fontSize: featured ? '13px' : '12px',
                    fontWeight: '700',
                    color: featured ? accent : 'var(--text-dim)',
                    fontFamily: "'Lato', sans-serif",
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {label}
                </p>
                {sublabel && (
                    <p style={{
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        fontFamily: "'Lato', sans-serif",
                        marginTop: '1px',
                    }}>
                        {sublabel}
                    </p>
                )}
            </div>
            <span style={{
                marginLeft: 'auto',
                fontSize: '11px',
                color: featured ? accent : 'var(--text-muted)',
                flexShrink: 0,
            }}>→</span>
        </a>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
/**
 * BuyBookLinks
 * Props:
 *   book        – objeto libro de PaperBoxd (title, author_name, isbn, google_books_id)
 *   compact     – versión compacta (solo íconos + texto corto)
 *   showLibrary – mostrar link a WorldCat (biblioteca)
 */
export default function BuyBookLinks({ book, compact = false, showLibrary = true }) {
    if (!book?.title) return null;

    const title = book.title || '';
    const author = book.author_name?.[0] || '';
    const isbn = book.isbn || null;
    const gbId = book.google_books_id || null;
    const gbUrl = buildGoogleBooksUrl(gbId);
    const isAR = true; // podés detectar por geolocalización si querés

    const stores = [
        {
            href: buildAmazonUrl(title, author, isbn),
            icon: '📦',
            label: 'Amazon',
            sublabel: 'Con envío',
            accent: '#ff9900',
            featured: true,
        },
        isAR && {
            href: buildMercadoLibreUrl(title, author),
            icon: '🛒',
            label: 'MercadoLibre',
            sublabel: 'Envío gratis',
            accent: '#ffe600',
            featured: false,
        },
        {
            href: buildCasaDelLibroUrl(title, author),
            icon: '📖',
            label: 'Casa del Libro',
            sublabel: 'Envío mundial',
            accent: '#388bfd',
            featured: false,
        },
        gbUrl && {
            href: gbUrl,
            icon: '📱',
            label: 'Google Books',
            sublabel: 'Versión digital',
            accent: '#4285f4',
            featured: false,
        },
        showLibrary && {
            href: buildLibraryUrl(title, author),
            icon: '🏛️',
            label: 'Biblioteca local',
            sublabel: 'WorldCat',
            accent: '#55cc88',
            featured: false,
        },
    ].filter(Boolean);

    if (compact) {
        return (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {stores.map((s) => (
                    <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        title={`Comprar en ${s.label}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '5px 10px',
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            fontSize: '12px',
                            color: 'var(--text-dim)',
                            textDecoration: 'none',
                            fontFamily: "'Lato', sans-serif",
                            fontWeight: '600',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.color = s.accent; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
                    >
                        <span>{s.icon}</span>
                        {s.label}
                    </a>
                ))}
            </div>
        );
    }

    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '18px 20px',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
            }}>
                <p style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--text-muted)',
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                    fontFamily: "'Lato', sans-serif",
                }}>
                    ¿Dónde conseguirlo?
                </p>
                <span style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    fontFamily: "'Lato', sans-serif",
                    fontStyle: 'italic',
                }}>
                    *puede ser link de afiliado
                </span>
            </div>

            {/* Stores grid */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            }}>
                {/* Featured store (Amazon) */}
                <StoreButton {...stores[0]} />

                {/* Rest */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '8px',
                }}>
                    {stores.slice(1).map(s => (
                        <StoreButton key={s.label} {...s} />
                    ))}
                </div>
            </div>

            {/* Disclaimer */}
            <p style={{
                marginTop: '12px',
                fontSize: '10px',
                color: 'var(--text-muted)',
                fontFamily: "'Lato', sans-serif",
                lineHeight: 1.5,
                fontStyle: 'italic',
            }}>
                Los precios y disponibilidad pueden variar. PaperBoxd puede recibir una comisión por compras a través de links de afiliado, sin costo adicional para vos.
            </p>
        </div>
    );
}
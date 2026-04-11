// frontend/src/pages/Dashboard/AchievementsTab.jsx
import { useMemo, useState } from 'react';
import {
    computeAchievements,
    RARITY_CONFIG,
    CATEGORY_LABELS,
    ACHIEVEMENTS,
} from '../../data/achievements';

// ── Badge card ────────────────────────────────────────────────────────────────
function BadgeCard({ ach, unlocked, index }) {
    const [hov, setHov] = useState(false);
    const rarity = RARITY_CONFIG[ach.rarity];

    return (
        <div
            className="fadeUp"
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                animationDelay: `${index * 0.04}s`,
                position: 'relative',
                background: unlocked
                    ? hov
                        ? rarity.bg.replace('0.1', '0.16').replace('0.12', '0.18')
                        : rarity.bg
                    : 'var(--surface)',
                border: `1px solid ${unlocked ? rarity.border : 'var(--border)'}`,
                borderRadius: '16px',
                padding: '20px 16px',
                textAlign: 'center',
                transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
                transform: hov && unlocked ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hov && unlocked
                    ? `0 12px 32px ${rarity.border}`
                    : 'none',
                opacity: unlocked ? 1 : 0.45,
                filter: unlocked ? 'none' : 'grayscale(1)',
                cursor: 'default',
            }}
        >
            {/* Rarity gem */}
            {unlocked && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    fontSize: '9px',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    color: rarity.color,
                    fontFamily: "'Lato', sans-serif",
                }}>
                    {rarity.label}
                </div>
            )}

            {/* Icon */}
            <div style={{
                fontSize: '38px',
                marginBottom: '10px',
                lineHeight: 1,
                filter: unlocked ? 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' : 'none',
            }}>
                {ach.icon}
            </div>

            {/* Title */}
            <p style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '13px',
                fontWeight: '700',
                color: unlocked ? 'var(--text)' : 'var(--text-muted)',
                marginBottom: '5px',
                lineHeight: 1.3,
            }}>
                {ach.title}
            </p>

            {/* Description */}
            <p style={{
                fontSize: '11px',
                color: unlocked ? 'var(--text-dim)' : 'var(--text-muted)',
                lineHeight: 1.55,
                fontFamily: "'Lato', sans-serif",
            }}>
                {unlocked ? ach.description : '???'}
            </p>

            {/* Unlocked shine */}
            {unlocked && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${rarity.color}08 0%, transparent 60%)`,
                    pointerEvents: 'none',
                }} />
            )}
        </div>
    );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function AchievementProgress({ unlocked, total }) {
    const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    return (
        <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
        }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-dim)', fontFamily: "'Lato', sans-serif", textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Progreso general
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent)', fontFamily: "'Syne', sans-serif" }}>
                        {unlocked}/{total}
                    </span>
                </div>
                <div style={{ height: '8px', background: 'var(--surface-3)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, var(--accent), var(--accent-3))',
                        borderRadius: '4px',
                        boxShadow: '0 0 8px var(--accent-glow)',
                        transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
                    }} />
                </div>
            </div>

            <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '36px',
                fontWeight: '700',
                color: 'var(--accent)',
                lineHeight: 1,
                minWidth: '60px',
                textAlign: 'right',
            }}>
                {pct}%
            </div>
        </div>
    );
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function AchievementsTab({ stats, reviews, quotesCount, dnfCount, importedGoodreads, isMobile }) {
    const [filter, setFilter] = useState('all');

    const extra = {
        quotesCount: quotesCount || 0,
        dnfCount: dnfCount || 0,
        importedGoodreads: importedGoodreads || false,
        nightReview: reviews?.some(r => {
            if (!r.created_at) return false;
            const h = new Date(r.created_at).getHours();
            return h >= 0 && h < 5;
        }) || false,
    };

    const { unlocked, locked } = useMemo(
        () => computeAchievements(stats || {}, reviews || [], extra),
        [stats, reviews, extra.quotesCount, extra.dnfCount, extra.importedGoodreads]
    );

    const unlockedIds = new Set(unlocked.map(a => a.id));

    const categories = ['all', ...Object.keys(CATEGORY_LABELS)];

    const filtered = ACHIEVEMENTS.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'unlocked') return unlockedIds.has(a.id);
        return a.category === filter;
    });

    return (
        <div>
            {/* Progress */}
            <AchievementProgress unlocked={unlocked.length} total={ACHIEVEMENTS.length} />

            {/* Filter chips */}
            <div className="tabs-scroll" style={{ marginBottom: '24px', gap: '6px' }}>
                {[
                    { id: 'all', label: '🏅 Todos' },
                    { id: 'unlocked', label: `✅ Desbloqueados (${unlocked.length})` },
                    ...Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label })),
                ].map(({ id, label }) => (
                    <button
                        key={id}
                        onClick={() => setFilter(id)}
                        style={{
                            padding: '7px 14px',
                            borderRadius: '100px',
                            fontSize: '12px',
                            fontWeight: filter === id ? '700' : '400',
                            whiteSpace: 'nowrap',
                            background: filter === id ? 'var(--accent)' : 'var(--surface)',
                            color: filter === id ? '#fff' : 'var(--text-muted)',
                            border: `1px solid ${filter === id ? 'var(--accent)' : 'var(--border-2)'}`,
                            cursor: 'pointer',
                            fontFamily: "'Figtree', sans-serif",
                            transition: 'all 0.15s',
                            boxShadow: filter === id ? '0 0 12px var(--accent-glow)' : 'none',
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px',
                    background: 'var(--accent-sub)', border: '1px solid var(--border)',
                    borderRadius: '18px',
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '14px' }}>🏆</div>
                    <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Sin logros en esta categoría</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>¡Seguí leyendo y reseñando!</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                        ? 'repeat(2, 1fr)'
                        : 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '14px',
                }}>
                    {filtered.map((ach, i) => (
                        <BadgeCard
                            key={ach.id}
                            ach={ach}
                            unlocked={unlockedIds.has(ach.id)}
                            index={i}
                        />
                    ))}
                </div>
            )}

            {/* Unlocked count footer */}
            {unlocked.length > 0 && (
                <p style={{
                    marginTop: '28px',
                    textAlign: 'center',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    fontFamily: "'Lato', sans-serif",
                    letterSpacing: '0.5px',
                }}>
                    Desbloqueaste <strong style={{ color: 'var(--accent)' }}>{unlocked.length}</strong> de{' '}
                    <strong>{ACHIEVEMENTS.length}</strong> logros
                </p>
            )}
        </div>
    );
}
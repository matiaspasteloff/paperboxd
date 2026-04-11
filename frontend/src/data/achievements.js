// frontend/src/data/achievements.js
// Sistema de logros/badges para PaperBoxd

export const ACHIEVEMENTS = [
    // ── Lectura ──────────────────────────────────────────────────────────
    {
        id: 'first_review',
        icon: '✍️',
        title: 'Primera reseña',
        description: 'Escribiste tu primera reseña',
        category: 'lectura',
        rarity: 'común',
        check: (stats, reviews) => reviews.length >= 1,
    },
    {
        id: 'five_reviews',
        icon: '📚',
        title: 'Lector en forma',
        description: 'Reseñaste 5 libros',
        category: 'lectura',
        rarity: 'común',
        check: (stats, reviews) => reviews.length >= 5,
    },
    {
        id: 'ten_reviews',
        icon: '🔟',
        title: 'Bookworm',
        description: 'Reseñaste 10 libros',
        category: 'lectura',
        rarity: 'poco común',
        check: (stats, reviews) => reviews.length >= 10,
    },
    {
        id: 'twenty_five_reviews',
        icon: '🌟',
        title: 'Bibliófilo',
        description: 'Reseñaste 25 libros',
        category: 'lectura',
        rarity: 'raro',
        check: (stats, reviews) => reviews.length >= 25,
    },
    {
        id: 'fifty_reviews',
        icon: '🏛️',
        title: 'Biblioteca viviente',
        description: 'Reseñaste 50 libros',
        category: 'lectura',
        rarity: 'épico',
        check: (stats, reviews) => reviews.length >= 50,
    },
    {
        id: 'hundred_reviews',
        icon: '💯',
        title: 'El Centenario',
        description: '100 libros reseñados. Leyenda.',
        category: 'lectura',
        rarity: 'legendario',
        check: (stats, reviews) => reviews.length >= 100,
    },

    // ── Calificaciones ───────────────────────────────────────────────────
    {
        id: 'perfect_five',
        icon: '⭐',
        title: 'Cinco estrellas',
        description: 'Diste tu primer 5/5',
        category: 'calificación',
        rarity: 'común',
        check: (stats, reviews) => reviews.some(r => r.rating === 5),
    },
    {
        id: 'harsh_critic',
        icon: '🔪',
        title: 'Crítico implacable',
        description: 'Diste un 1/5. Sin piedad.',
        category: 'calificación',
        rarity: 'poco común',
        check: (stats, reviews) => reviews.some(r => r.rating === 1),
    },
    {
        id: 'high_standards',
        icon: '🎯',
        title: 'Alto estándar',
        description: 'Promedio de 4+ estrellas con 10+ reseñas',
        category: 'calificación',
        rarity: 'raro',
        check: (stats, reviews) => reviews.length >= 10 && stats.avg_rating >= 4,
    },

    // ── Social ───────────────────────────────────────────────────────────
    {
        id: 'first_follower',
        icon: '👥',
        title: 'Influencer emergente',
        description: 'Alguien te empezó a seguir',
        category: 'social',
        rarity: 'común',
        check: (stats) => stats.followers_count >= 1,
    },
    {
        id: 'ten_followers',
        icon: '📣',
        title: 'Voz de la comunidad',
        description: '10 seguidores',
        category: 'social',
        rarity: 'poco común',
        check: (stats) => stats.followers_count >= 10,
    },
    {
        id: 'fifty_followers',
        icon: '🌍',
        title: 'Referente literario',
        description: '50 seguidores',
        category: 'social',
        rarity: 'épico',
        check: (stats) => stats.followers_count >= 50,
    },

    // ── Géneros ──────────────────────────────────────────────────────────
    {
        id: 'genre_explorer',
        icon: '🗺️',
        title: 'Explorador de géneros',
        description: 'Reseñaste libros de 3 géneros distintos',
        category: 'diversidad',
        rarity: 'poco común',
        check: (stats) => Object.keys(stats.genres || {}).length >= 3,
    },
    {
        id: 'omnivore',
        icon: '🌈',
        title: 'Omnívoro literario',
        description: 'Reseñaste libros de 6+ géneros distintos',
        category: 'diversidad',
        rarity: 'raro',
        check: (stats) => Object.keys(stats.genres || {}).length >= 6,
    },

    // ── Constancia ───────────────────────────────────────────────────────
    {
        id: 'goal_setter',
        icon: '🎯',
        title: 'Con metas claras',
        description: 'Configuraste tu reto anual de lectura',
        category: 'constancia',
        rarity: 'común',
        check: (stats) => (stats.reading_goal || 0) > 0,
    },
    {
        id: 'challenge_half',
        icon: '🏃',
        title: 'A mitad de camino',
        description: 'Completaste el 50% de tu reto anual',
        category: 'constancia',
        rarity: 'poco común',
        check: (stats) => {
            if (!stats.reading_goal || stats.reading_goal === 0) return false;
            return stats.total_finished >= stats.reading_goal * 0.5;
        },
    },
    {
        id: 'challenge_complete',
        icon: '🏆',
        title: '¡Reto cumplido!',
        description: 'Completaste tu reto anual de lectura',
        category: 'constancia',
        rarity: 'épico',
        check: (stats) => {
            if (!stats.reading_goal || stats.reading_goal === 0) return false;
            return stats.total_finished >= stats.reading_goal;
        },
    },

    // ── Quotes / DNF ─────────────────────────────────────────────────────
    {
        id: 'quote_saver',
        icon: '💬',
        title: 'Cazador de frases',
        description: 'Guardaste tu primera cita',
        category: 'contenido',
        rarity: 'común',
        check: (stats, reviews, extra) => (extra?.quotesCount || 0) >= 1,
    },
    {
        id: 'dnf_honest',
        icon: '🚫',
        title: 'Honestidad brutal',
        description: 'Marcaste tu primer libro como DNF',
        category: 'contenido',
        rarity: 'común',
        check: (stats, reviews, extra) => (extra?.dnfCount || 0) >= 1,
    },

    // ── Especiales ───────────────────────────────────────────────────────
    {
        id: 'night_owl',
        icon: '🦉',
        title: 'Lectura nocturna',
        description: 'Reseñaste un libro después de medianoche',
        category: 'especial',
        rarity: 'poco común',
        check: (stats, reviews, extra) => extra?.nightReview === true,
    },
    {
        id: 'goodreads_migrant',
        icon: '📗',
        title: 'Bienvenido a casa',
        description: 'Importaste tu biblioteca desde GoodReads',
        category: 'especial',
        rarity: 'raro',
        check: (stats, reviews, extra) => extra?.importedGoodreads === true,
    },
];

export const RARITY_CONFIG = {
    'común': { color: '#888', bg: 'rgba(136,136,136,0.1)', border: 'rgba(136,136,136,0.25)', label: 'Común' },
    'poco común': { color: '#55cc88', bg: 'rgba(85,204,136,0.1)', border: 'rgba(85,204,136,0.3)', label: 'Poco común' },
    'raro': { color: '#388bfd', bg: 'rgba(56,139,253,0.1)', border: 'rgba(56,139,253,0.3)', label: 'Raro' },
    'épico': { color: '#cc88ff', bg: 'rgba(204,136,255,0.1)', border: 'rgba(204,136,255,0.3)', label: 'Épico' },
    'legendario': { color: '#ffcc44', bg: 'rgba(255,204,68,0.12)', border: 'rgba(255,204,68,0.4)', label: 'Legendario' },
};

export const CATEGORY_LABELS = {
    lectura: '📚 Lectura',
    calificación: '⭐ Calificación',
    social: '👥 Social',
    diversidad: '🌈 Diversidad',
    constancia: '🎯 Constancia',
    contenido: '✍️ Contenido',
    especial: '✨ Especial',
};

/**
 * Calcula los logros desbloqueados de un usuario.
 * @param {Object} stats - Stats del backend
 * @param {Array}  reviews - Reseñas del usuario
 * @param {Object} extra - Datos adicionales (quotesCount, dnfCount, etc.)
 * @returns {{ unlocked: Achievement[], locked: Achievement[] }}
 */
export function computeAchievements(stats, reviews = [], extra = {}) {
    const unlocked = [];
    const locked = [];

    for (const ach of ACHIEVEMENTS) {
        try {
            if (ach.check(stats, reviews, extra)) {
                unlocked.push(ach);
            } else {
                locked.push(ach);
            }
        } catch {
            locked.push(ach);
        }
    }

    return { unlocked, locked };
}
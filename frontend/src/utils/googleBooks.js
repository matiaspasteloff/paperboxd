/**
 * Adapts a Google Books API volume item to PaperBoxd's internal book format.
 * Maintains backward compatibility with OpenLibrary-based components.
 */
export const adaptGoogleBook = (item) => {
    if (!item) return null;
    const info = item.volumeInfo || {};

    // Prefer larger cover image
    const raw = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
    const cover = raw.replace('http://', 'https://').replace('zoom=1', 'zoom=2') || null;

    const year = info.publishedDate ? parseInt(info.publishedDate.slice(0, 4)) : null;

    return {
        // Core fields (compatible with existing components)
        key: `/works/${item.id}`,
        title: info.title || 'Sin título',
        author_name: info.authors || [],
        cover_url: cover,
        cover_i: null,                         // legacy field — null since we use cover_url
        first_publish_year: year,

        // Extended Google Books fields
        google_books_id: item.id,
        description: info.description || '',
        categories: info.categories || [],
        page_count: info.pageCount || 0,
        publisher: info.publisher || '',
        language: info.language || '',
        isbn: info.industryIdentifiers?.find(i => i.type === 'ISBN_13')?.identifier || '',
        average_rating: info.averageRating || null,
        ratings_count: info.ratingsCount || 0,
    };
};

/** Map our internal subject IDs to Google Books-friendly queries */
export const SUBJECT_QUERY_MAP = {
    science_fiction: 'subject:science+fiction',
    fantasy: 'subject:fantasy',
    mystery: 'subject:mystery',
    romance: 'subject:romance',
    history: 'subject:history',
    biography: 'subject:biography',
    horror: 'subject:horror',
    classics: 'subject:classics',
};
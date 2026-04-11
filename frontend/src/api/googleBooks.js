const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const GB = 'https://www.googleapis.com/books/v1';

/**
 * Adapts a Google Books API volume item to PaperBoxd's internal book format.
 * Maintains backward compatibility with OpenLibrary-based components.
 */
export const adaptGoogleBook = (item) => {
  if (!item) return null;
  const info = item.volumeInfo || {};
  const raw = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
  const cover = raw.replace('http://', 'https://').replace('zoom=1', 'zoom=2') || null;
  const year = info.publishedDate ? parseInt(info.publishedDate.slice(0, 4)) : null;

  return {
    key: `/works/${item.id}`,
    title: info.title || 'Sin título',
    author_name: info.authors || [],
    cover_url: cover,
    cover_i: null,
    first_publish_year: year,
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

/** Fetch from Google Books and return adapted books filtered to those with covers */
export const gbFetch = async (params, maxResults = 16) => {
  const qs = new URLSearchParams({
    printType: 'books',
    maxResults: String(maxResults),
    key: API_KEY,
    ...params,
  });
  try {
    const r = await fetch(`${GB}/volumes?${qs}`);
    const d = await r.json();
    return (d.items || []).map(adaptGoogleBook).filter(b => b && b.cover_url);
  } catch {
    return [];
  }
};

export const getBookDetails = async (volumeId) => {
  try {
    const r = await fetch(`${GB}/volumes/${volumeId}?key=${API_KEY}`);
    if (!r.ok) return null;
    return adaptGoogleBook(await r.json());
  } catch {
    return null;
  }
};
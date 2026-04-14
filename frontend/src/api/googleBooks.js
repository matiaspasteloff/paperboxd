const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const GB = 'https://www.googleapis.com/books/v1';

/**
 * Adapts a Google Books API volume item to BookLog's internal book format.
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

/**
 * Returns true only for covers that are likely to be real, full-quality images.
 * Google Books sometimes returns blurry scanned snippet thumbnails that look bad.
 */
const isGoodCover = (url) => {
  if (!url) return false;
  // Reject edge=curl: these are the "curled page" snippet scans — always blurry
  if (url.includes('edge=curl')) return false;
  // Reject raw GBS snippet images that have no zoom parameter — usually low-res scans
  if (url.includes('books.google') && !url.includes('zoom=') && url.includes('img=1')) return false;
  return true;
};

/**
 * Returns a weekly-rotating trending query so the home page feels fresh each week.
 * Uses the ISO week number so it changes every Monday automatically.
 */
const getWeeklyTrendingQuery = () => {
  const now = new Date();
  // ISO week number: 1-52
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);

  const rotatingQueries = [
    'bestseller literary fiction 2024',
    'award winning novels 2024',
    'most read books 2024 fiction',
    'popular thriller mystery 2024',
    'debut novels bestseller 2024',
    'book club picks 2024',
    'new releases fiction 2024',
    'critically acclaimed novels 2024',
    'pulitzer prize fiction',
    'booker prize shortlist',
    'oprah book club 2024',
    'most anticipated books 2024',
  ];

  const index = week % rotatingQueries.length;
  return rotatingQueries[index];
};

/** Fetch from Google Books and return adapted books filtered to those with good covers */
export const gbFetch = async (params, maxResults = 20) => {
  const qs = new URLSearchParams({
    printType: 'books',
    maxResults: String(maxResults),
    key: API_KEY,
    ...params,
  });
  try {
    const r = await fetch(`${GB}/volumes?${qs}`);
    const d = await r.json();
    return (d.items || [])
      .map(adaptGoogleBook)
      .filter(b => {
        if (!b || !b.cover_url) return false;
        if (!isGoodCover(b.cover_url)) return false;
        if (!b.title || b.title.length < 2) return false;
        return true;
      });
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

export { getWeeklyTrendingQuery };
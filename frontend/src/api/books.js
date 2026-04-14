import { gbFetch, getBookDetails, SUBJECT_QUERY_MAP, getWeeklyTrendingQuery } from './googleBooks';

export const searchBooks = async (q) => {
  const books = await gbFetch({ q: q.trim(), orderBy: 'relevance' }, 16);
  return { docs: books };
};

export const getTrending = async () => {
  const query = getWeeklyTrendingQuery();
  const books = await gbFetch({ q: query, orderBy: 'relevance' }, 20);
  return { works: books };
};

export const getSubject = async (s) => {
  const q = SUBJECT_QUERY_MAP[s] || `subject:${s}`;
  const books = await gbFetch({ q, orderBy: 'relevance' }, 10);
  return { works: books };
};

export { getBookDetails };
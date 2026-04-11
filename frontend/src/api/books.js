import { gbFetch, getBookDetails, SUBJECT_QUERY_MAP } from './googleBooks';

export const searchBooks = async (q) => {
  const books = await gbFetch({ q: q.trim(), orderBy: 'relevance' }, 16);
  return { docs: books };
};

export const getTrending = async () => {
  const books = await gbFetch({ q: 'bestseller fiction 2024', orderBy: 'relevance' }, 16);
  return { works: books };
};

export const getSubject = async (s) => {
  const q = SUBJECT_QUERY_MAP[s] || `subject:${s}`;
  const books = await gbFetch({ q, orderBy: 'relevance' }, 8);
  return { works: books };
};

export { getBookDetails };
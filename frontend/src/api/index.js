import * as authApi from './auth';
import * as socialApi from './social';
import * as booksApi from './books';
import * as reviewsApi from './reviews';
import * as contentApi from './content';

/**
 * Unified `api` object — maintains full backwards compatibility with
 * all existing import sites: `import { api } from '../api'`
 */
export const api = {
  ...authApi,
  ...socialApi,
  ...booksApi,
  ...reviewsApi,
  ...contentApi,
};

// Also export Google Books utilities for components that need them directly
export { adaptGoogleBook, SUBJECT_QUERY_MAP } from './googleBooks';
import { call, h, BASE } from './client';

export const getBookReviews = (workId) =>
  call(`${BASE}/books/${workId}/reviews`);

export const createReview = (token, body) =>
  call(`${BASE}/my-reviews/`, { method: 'POST', headers: h(token), body: JSON.stringify(body) });

export const getMyReviews = (token) =>
  call(`${BASE}/my-reviews/`, { headers: h(token) });
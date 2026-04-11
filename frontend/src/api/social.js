import { call, h, BASE } from './client';

export const searchUsers = (q) =>
  call(`${BASE}/users/search?q=${encodeURIComponent(q)}`);

export const getProfile = (username, token) =>
  call(`${BASE}/users/${username}`, { headers: h(token) });

export const getUserReviews = (username) =>
  call(`${BASE}/users/${username}/reviews`);

export const toggleFollow = (token, username) =>
  call(`${BASE}/users/${username}/follow`, { method: 'POST', headers: h(token) });

export const getFollowers = (username) =>
  call(`${BASE}/users/${username}/followers`);

export const getFollowing = (username) =>
  call(`${BASE}/users/${username}/following`);

export const getFeed = (token) =>
  call(`${BASE}/feed/`, { headers: h(token) });
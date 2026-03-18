import axios from 'axios';
import { getToken } from './auth';
import type { TmdbShow, TmdbShowDetail, FollowedShow, Review, UserProfile } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  register: (username: string, email: string, password: string) =>
    api.post<{ token: string; user: { id: number; username: string; email: string } }>('/auth/register', {
      username,
      email,
      password,
    }),
  login: (email: string, password: string) =>
    api.post<{ token: string; user: { id: number; username: string; email: string } }>('/auth/login', {
      email,
      password,
    }),
  me: () =>
    api.get<{ user: { id: number; username: string; email: string } }>('/auth/me'),
};

// Shows
export const showsApi = {
  search: (q: string) => api.get<{ results: TmdbShow[] }>('/shows/search', { params: { q } }),
  detail: (id: number) => api.get<TmdbShowDetail>(`/shows/${id}`),
};

// Follows
export const followsApi = {
  getFollows: () => api.get<FollowedShow[]>('/follows'),
  follow: (tmdbShowId: number, showName: string, posterPath: string | null) =>
    api.post<FollowedShow>('/follows', { tmdbShowId, showName, posterPath }),
  unfollow: (tmdbId: number) => api.delete(`/follows/${tmdbId}`),
};

// Reviews
export const reviewsApi = {
  forShow: (tmdbId: number) => api.get<Review[]>(`/reviews/show/${tmdbId}`),
  forUser: (username: string) => api.get<Review[]>(`/reviews/user/${username}`),
  create: (tmdbShowId: number, showName: string, posterPath: string | null, rating: number, body: string) =>
    api.post<Review>('/reviews', { tmdbShowId, showName, posterPath, rating, body }),
  update: (tmdbId: number, rating: number, body: string) =>
    api.put<Review>(`/reviews/${tmdbId}`, { rating, body }),
  delete: (tmdbId: number) => api.delete(`/reviews/${tmdbId}`),
};

// Users
export const usersApi = {
  profile: (username: string) => api.get<UserProfile>(`/users/${username}`),
  follows: (username: string) => api.get<FollowedShow[]>(`/users/${username}/follows`),
};

export default api;

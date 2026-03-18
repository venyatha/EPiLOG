import axios from 'axios';

const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.TMDB_API_KEY,
  },
});

export interface TmdbShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  first_air_date: string;
  vote_average: number;
}

export interface TmdbShowDetail extends TmdbShow {
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  networks: { id: number; name: string; logo_path: string | null }[];
}

export interface TmdbSearchResponse {
  results: TmdbShow[];
  total_results: number;
  total_pages: number;
}

export async function searchShows(query: string): Promise<TmdbShow[]> {
  const response = await tmdb.get<TmdbSearchResponse>('/search/tv', {
    params: { query, include_adult: false },
  });
  return response.data.results;
}

export async function getShow(id: number): Promise<TmdbShowDetail> {
  const response = await tmdb.get<TmdbShowDetail>(`/tv/${id}`);
  return response.data;
}

export function posterUrl(path: string | null, size: 'w500' | 'original' = 'w500'): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export default tmdb;

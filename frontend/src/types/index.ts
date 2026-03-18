export interface User {
  id: number;
  username: string;
  email: string;
}

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

export interface FollowedShow {
  id: number;
  userId: number;
  tmdbShowId: number;
  showName: string;
  posterPath: string | null;
  followedAt: string;
}

export interface Review {
  id: number;
  userId: number;
  tmdbShowId: number;
  showName: string;
  posterPath: string | null;
  rating: number;
  body: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { username: string };
}

export interface UserProfile {
  id: number;
  username: string;
  createdAt: string;
  _count: { followedShows: number; reviews: number };
}

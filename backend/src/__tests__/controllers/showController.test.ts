import request from 'supertest';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the axios instance created in tmdb.ts
jest.mock('../../lib/tmdb', () => {
  const actual = jest.requireActual('../../lib/tmdb');
  return {
    ...actual,
    searchShows: jest.fn(),
    getShow: jest.fn(),
  };
});

// Prisma not needed for show tests
jest.mock('../../lib/prisma', () => ({
  __esModule: true,
  default: {},
}));

import { searchShows, getShow } from '../../lib/tmdb';
import app from '../testApp';

const mockSearchShows = searchShows as jest.MockedFunction<typeof searchShows>;
const mockGetShow = getShow as jest.MockedFunction<typeof getShow>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/shows/search', () => {
  it('returns 400 when q is missing', async () => {
    const res = await request(app).get('/api/shows/search');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/);
  });

  it('returns 400 when q is empty string', async () => {
    const res = await request(app).get('/api/shows/search?q=   ');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/);
  });

  it('returns 200 with results on valid query', async () => {
    const mockShow = {
      id: 1,
      name: 'Breaking Bad',
      overview: 'A show',
      poster_path: '/bp.jpg',
      first_air_date: '2008-01-20',
      vote_average: 9.5,
    };
    mockSearchShows.mockResolvedValue([mockShow]);

    const res = await request(app).get('/api/shows/search?q=breaking');
    expect(res.status).toBe(200);
    expect(res.body.results).toHaveLength(1);
    expect(res.body.results[0].name).toBe('Breaking Bad');
  });
});

describe('GET /api/shows/:id', () => {
  it('returns 400 for non-numeric id', async () => {
    const res = await request(app).get('/api/shows/abc');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid/);
  });

  it('returns 200 with show detail for valid id', async () => {
    const mockDetail = {
      id: 1396,
      name: 'Breaking Bad',
      overview: 'Chemistry teacher',
      poster_path: '/bp.jpg',
      first_air_date: '2008-01-20',
      vote_average: 9.5,
      genres: [{ id: 18, name: 'Drama' }],
      number_of_seasons: 5,
      number_of_episodes: 62,
      status: 'Ended',
      networks: [{ id: 174, name: 'AMC', logo_path: null }],
    };
    mockGetShow.mockResolvedValue(mockDetail);

    const res = await request(app).get('/api/shows/1396');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Breaking Bad');
    expect(res.body.number_of_seasons).toBe(5);
  });
});

import { posterUrl } from '../../lib/tmdb';

describe('posterUrl', () => {
  it('returns null for null path', () => {
    expect(posterUrl(null)).toBeNull();
  });

  it('returns w500 URL for a valid path', () => {
    expect(posterUrl('/test.jpg')).toBe('https://image.tmdb.org/t/p/w500/test.jpg');
  });

  it('returns original size URL when size is "original"', () => {
    expect(posterUrl('/test.jpg', 'original')).toBe('https://image.tmdb.org/t/p/original/test.jpg');
  });
});

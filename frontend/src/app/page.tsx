'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { showsApi } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import ShowCard from '@/components/ShowCard';
import type { TmdbShow } from '@/types';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TmdbShow[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    showsApi
      .search(debouncedQuery)
      .then((res) => setResults(res.data.results))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      {!query && (
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-green-400 mb-4">EPiLOG</h1>
          <p className="text-zinc-400 text-lg mb-2">
            Track, rate, and review TV shows you love.
          </p>
          <p className="text-zinc-500 text-sm">
            <Link href="/register" className="text-green-400 hover:underline">
              Create an account
            </Link>{' '}
            or{' '}
            <Link href="/login" className="text-green-400 hover:underline">
              sign in
            </Link>{' '}
            to get started.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a TV show..."
          className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 text-lg"
        />
      </div>

      {/* Results */}
      {loading && (
        <p className="text-zinc-400 text-center">Searching...</p>
      )}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      )}
      {!loading && query && results.length === 0 && (
        <p className="text-zinc-400 text-center">No results found.</p>
      )}
    </div>
  );
}

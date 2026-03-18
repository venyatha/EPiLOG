'use client';

import { useState, useEffect } from 'react';
import { showsApi } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import type { TmdbShow } from '@/types';

interface Props {
  onResults: (results: TmdbShow[]) => void;
  placeholder?: string;
}

export default function SearchBar({ onResults, placeholder = 'Search for a TV show...' }: Props) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      onResults([]);
      return;
    }
    showsApi
      .search(debouncedQuery)
      .then((res) => onResults(res.data.results))
      .catch(() => onResults([]));
  }, [debouncedQuery, onResults]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-green-500"
    />
  );
}

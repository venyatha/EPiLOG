'use client';

import { useState } from 'react';
import { reviewsApi } from '@/lib/api';
import StarRating from './StarRating';
import type { Review } from '@/types';

interface Props {
  tmdbShowId: number;
  showName: string;
  posterPath: string | null;
  existing: Review | null;
  onSaved: (review: Review) => void;
  onCancel: () => void;
}

export default function ReviewForm({
  tmdbShowId,
  showName,
  posterPath,
  existing,
  onSaved,
  onCancel,
}: Props) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [body, setBody] = useState(existing?.body || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let res;
      if (existing) {
        res = await reviewsApi.update(tmdbShowId, rating, body);
      } else {
        res = await reviewsApi.create(tmdbShowId, showName, posterPath, rating, body);
      }
      onSaved(res.data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Failed to save review';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-zinc-900 border border-zinc-700 rounded-lg p-5 space-y-4"
    >
      <h3 className="text-lg font-semibold text-zinc-200">
        {existing ? 'Edit Review' : 'Write a Review'}
      </h3>
      <div>
        <label className="block text-zinc-400 text-sm mb-2">Rating</label>
        <StarRating rating={rating} onChange={setRating} />
        {rating > 0 && (
          <span className="text-zinc-500 text-xs mt-1 block">{rating}/10</span>
        )}
      </div>
      <div>
        <label className="block text-zinc-400 text-sm mb-1">Review (optional)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="What did you think?"
          className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-green-500 resize-none"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-semibold text-sm disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving...' : existing ? 'Update Review' : 'Submit Review'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

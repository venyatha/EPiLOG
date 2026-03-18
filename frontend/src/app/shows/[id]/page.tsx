'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { showsApi, reviewsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import FollowButton from '@/components/FollowButton';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import StarRating from '@/components/StarRating';
import type { TmdbShowDetail, Review } from '@/types';

export default function ShowDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [show, setShow] = useState<TmdbShowDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tmdbId = parseInt(id, 10);
    Promise.all([
      showsApi.detail(tmdbId).then((r) => setShow(r.data)),
      reviewsApi.forShow(tmdbId).then((r) => {
        setReviews(r.data);
        if (user) {
          const mine = r.data.find((rev) => rev.userId === user.id) || null;
          setMyReview(mine);
        }
      }),
    ]).finally(() => setLoading(false));
  }, [id, user]);

  function handleReviewSaved(review: Review) {
    setMyReview(review);
    setReviews((prev) => {
      const exists = prev.find((r) => r.id === review.id);
      if (exists) return prev.map((r) => (r.id === review.id ? review : r));
      return [review, ...prev];
    });
    setShowForm(false);
  }

  async function handleDeleteReview() {
    if (!show) return;
    await reviewsApi.delete(show.id);
    setMyReview(null);
    setReviews((prev) => prev.filter((r) => r.userId !== user?.id));
  }

  if (loading || !show) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : null;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex gap-8 mb-10">
        {/* Poster */}
        <div className="flex-shrink-0">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={show.name}
              width={200}
              height={300}
              className="rounded-lg"
            />
          ) : (
            <div className="w-[200px] h-[300px] bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600">
              No Image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">{show.name}</h1>
          <div className="flex flex-wrap gap-2 mb-3">
            {show.genres.map((g) => (
              <span key={g.id} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400">
                {g.name}
              </span>
            ))}
          </div>
          <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{show.overview}</p>
          <div className="grid grid-cols-2 gap-2 text-sm text-zinc-400 mb-4">
            <span>First aired: {show.first_air_date || 'N/A'}</span>
            <span>Status: {show.status}</span>
            <span>Seasons: {show.number_of_seasons}</span>
            <span>Episodes: {show.number_of_episodes}</span>
          </div>
          {avgRating && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={parseFloat(avgRating)} readOnly />
              <span className="text-zinc-400 text-sm">
                {avgRating}/10 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}
          <div className="flex gap-3">
            <FollowButton tmdbShowId={show.id} showName={show.name} posterPath={show.poster_path} />
            {user && !myReview && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm transition-colors"
              >
                Write a Review
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showForm && show && (
        <div className="mb-8">
          <ReviewForm
            tmdbShowId={show.id}
            showName={show.name}
            posterPath={show.poster_path}
            existing={myReview}
            onSaved={handleReviewSaved}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* My Review */}
      {myReview && !showForm && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-200 mb-3">Your Review</h2>
          <ReviewCard review={myReview} />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-green-400 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteReview}
              className="text-sm text-red-400 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* All Reviews */}
      <section>
        <h2 className="text-xl font-semibold text-zinc-200 mb-4">
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-zinc-500">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews
              .filter((r) => r.userId !== user?.id)
              .map((r) => (
                <ReviewCard key={r.id} review={r} showUsername />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { followsApi, reviewsApi } from '@/lib/api';
import ShowCard from '@/components/ShowCard';
import ReviewCard from '@/components/ReviewCard';
import type { FollowedShow, Review } from '@/types';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [follows, setFollows] = useState<FollowedShow[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      followsApi.getFollows().then((r) => setFollows(r.data)),
      reviewsApi.forUser(user.username).then((r) => setReviews(r.data)),
    ]).finally(() => setDataLoading(false));
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          Welcome, <span className="text-green-400">{user.username}</span>
        </h1>
        <Link
          href={`/users/${user.username}`}
          className="text-sm text-zinc-400 hover:text-green-400 transition-colors"
        >
          View public profile →
        </Link>
      </div>

      {dataLoading ? (
        <p className="text-zinc-400">Loading your data...</p>
      ) : (
        <>
          {/* Followed Shows */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-zinc-200 mb-4">
              Following ({follows.length})
            </h2>
            {follows.length === 0 ? (
              <p className="text-zinc-500">
                You haven&apos;t followed any shows yet.{' '}
                <Link href="/" className="text-green-400 hover:underline">
                  Search for shows
                </Link>
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {follows.map((f) => (
                  <ShowCard
                    key={f.id}
                    show={{
                      id: f.tmdbShowId,
                      name: f.showName,
                      poster_path: f.posterPath,
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-xl font-semibold text-zinc-200 mb-4">
              Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-zinc-500">You haven&apos;t reviewed any shows yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

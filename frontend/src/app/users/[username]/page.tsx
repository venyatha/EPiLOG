'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usersApi, reviewsApi } from '@/lib/api';
import ShowCard from '@/components/ShowCard';
import ReviewCard from '@/components/ReviewCard';
import type { UserProfile, FollowedShow, Review } from '@/types';

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [follows, setFollows] = useState<FollowedShow[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      usersApi.profile(username).then((r) => setProfile(r.data)),
      usersApi.follows(username).then((r) => setFollows(r.data)),
      reviewsApi.forUser(username).then((r) => setReviews(r.data)),
    ])
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-400">User not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Profile header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-green-400 mb-1">{profile.username}</h1>
        <p className="text-zinc-500 text-sm">
          Member since {new Date(profile.createdAt).toLocaleDateString()} &middot;{' '}
          {profile._count.followedShows} following &middot; {profile._count.reviews} reviews
        </p>
      </div>

      {/* Followed Shows */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-200 mb-4">
          Following ({follows.length})
        </h2>
        {follows.length === 0 ? (
          <p className="text-zinc-500">Not following any shows.</p>
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
          <p className="text-zinc-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

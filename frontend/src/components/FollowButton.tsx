'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { followsApi } from '@/lib/api';

interface Props {
  tmdbShowId: number;
  showName: string;
  posterPath: string | null;
}

export default function FollowButton({ tmdbShowId, showName, posterPath }: Props) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    followsApi.getFollows().then((res) => {
      setFollowing(res.data.some((f) => f.tmdbShowId === tmdbShowId));
    });
  }, [user, tmdbShowId]);

  if (!user) return null;

  async function toggle() {
    setLoading(true);
    try {
      if (following) {
        await followsApi.unfollow(tmdbShowId);
        setFollowing(false);
      } else {
        await followsApi.follow(tmdbShowId, showName, posterPath);
        setFollowing(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-4 py-2 rounded font-semibold text-sm transition-colors disabled:opacity-50 ${
        following
          ? 'bg-zinc-700 hover:bg-red-900 text-zinc-100 border border-zinc-600'
          : 'bg-green-500 hover:bg-green-600 text-white'
      }`}
    >
      {loading ? '...' : following ? 'Following' : 'Follow'}
    </button>
  );
}

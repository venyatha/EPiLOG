import Link from 'next/link';
import Image from 'next/image';
import StarRating from './StarRating';
import type { Review } from '@/types';

interface Props {
  review: Review;
  showUsername?: boolean;
}

export default function ReviewCard({ review, showUsername = false }: Props) {
  const posterUrl = review.posterPath
    ? `https://image.tmdb.org/t/p/w500${review.posterPath}`
    : null;

  return (
    <div className="flex gap-4 bg-zinc-900 rounded-lg p-4 border border-zinc-800">
      {posterUrl && (
        <Link href={`/shows/${review.tmdbShowId}`} className="flex-shrink-0">
          <Image
            src={posterUrl}
            alt={review.showName}
            width={60}
            height={90}
            className="rounded object-cover"
          />
        </Link>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            href={`/shows/${review.tmdbShowId}`}
            className="font-semibold text-zinc-100 hover:text-green-400 transition-colors truncate"
          >
            {review.showName}
          </Link>
          <StarRating rating={review.rating} readOnly />
        </div>
        {showUsername && review.user && (
          <p className="text-xs text-zinc-500 mb-1">
            by{' '}
            <Link href={`/users/${review.user.username}`} className="text-green-400 hover:underline">
              {review.user.username}
            </Link>
          </p>
        )}
        {review.body && (
          <p className="text-zinc-400 text-sm leading-relaxed">{review.body}</p>
        )}
        <p className="text-zinc-600 text-xs mt-2">
          {new Date(review.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

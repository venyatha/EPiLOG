import Link from 'next/link';
import Image from 'next/image';
import type { TmdbShow } from '@/types';

interface Props {
  show: Pick<TmdbShow, 'id' | 'name' | 'poster_path'>;
}

export default function ShowCard({ show }: Props) {
  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : null;

  return (
    <Link href={`/shows/${show.id}`} className="group block">
      <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-zinc-800 mb-2">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={show.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs px-2 text-center">
            No Image
          </div>
        )}
      </div>
      <p className="text-xs text-zinc-300 group-hover:text-green-400 transition-colors line-clamp-2 leading-tight">
        {show.name}
      </p>
    </Link>
  );
}

'use client';

interface Props {
  rating: number;
  readOnly?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, readOnly = false, onChange }: Props) {
  const stars = Array.from({ length: 10 }, (_, i) => i + 1);

  if (readOnly) {
    return (
      <div className="flex gap-0.5" title={`${rating}/10`}>
        {stars.map((s) => (
          <span
            key={s}
            className={`text-sm ${s <= rating ? 'text-yellow-400' : 'text-zinc-700'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-0.5">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          className={`text-xl transition-colors hover:text-yellow-300 ${
            s <= rating ? 'text-yellow-400' : 'text-zinc-600'
          }`}
          aria-label={`Rate ${s}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

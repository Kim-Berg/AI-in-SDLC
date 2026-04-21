interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  label?: string;
}

export function StarRating({ value, onChange, size = 'md', readOnly, label }: StarRatingProps) {
  const interactive = !readOnly && Boolean(onChange);
  const clamped = Math.max(0, Math.min(5, value));
  const fillPercent = (clamped / 5) * 100;

  if (!interactive) {
    return (
      <span
        className={`star-rating star-rating--${size} star-rating--readonly`}
        role="img"
        aria-label={label ?? `Rated ${clamped.toFixed(1)} out of 5`}
      >
        <span className="star-rating__track" aria-hidden="true">
          ★★★★★
        </span>
        <span className="star-rating__fill" style={{ width: `${fillPercent}%` }} aria-hidden="true">
          ★★★★★
        </span>
      </span>
    );
  }

  return (
    <span
      className={`star-rating star-rating--${size} star-rating--interactive`}
      role="radiogroup"
      aria-label={label ?? 'Rating'}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={clamped === n}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          className={`star-rating__star${n <= clamped ? ' star-rating__star--active' : ''}`}
          onClick={() => onChange?.(n)}
        >
          ★
        </button>
      ))}
    </span>
  );
}

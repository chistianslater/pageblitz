import React from "react";

/** Markiert echte Google-Bewertungen: Studio macht sie nicht contenteditable. */
export const REVIEW_READONLY = { "data-pb-readonly": "" } as const;

export function reviewInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    const word = parts[0]!;
    return word.slice(0, Math.min(2, word.length)).toUpperCase();
  }
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function ReviewStars({ rating }: { rating?: number }) {
  if (rating == null || !Number.isFinite(rating)) return null;
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span
      className="pb-review-stars"
      // role="img": aria-label ist auf rollenlosen Spans verboten
      // (axe aria-prohibited-attr) — als Bild beschreibt es die Sterne.
      role="img"
      aria-label={`${filled} von 5 Sternen`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="pb-review-star"
          data-on={i < filled ? "" : undefined}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function ReviewAuthor({ author }: { author: string }) {
  return (
    <span className="pb-review-byline">
      <span className="pb-review-avatar" aria-hidden="true">
        {reviewInitials(author)}
      </span>
      <span className="pb-review-meta">
        <b>{author}</b>
        <span className="pb-review-source">Google-Bewertung</span>
      </span>
    </span>
  );
}

interface GoogleReviewBodyProps {
  author: string;
  text: string;
  rating?: number;
}

/** Sterne, Zitat, Autor — für alle 14 Packs, optisch über Pack-CSS. */
export function GoogleReviewBody({
  author,
  text,
  rating,
}: GoogleReviewBodyProps) {
  return (
    <>
      <ReviewStars rating={rating} />
      <p>{text}</p>
      <footer>
        <ReviewAuthor author={author} />
      </footer>
    </>
  );
}

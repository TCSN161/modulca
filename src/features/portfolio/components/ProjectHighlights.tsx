/**
 * ProjectHighlights — bulleted list of key features with check icons.
 * Used on both cards and detail pages.
 */

interface Props {
  highlights: string[];
}

export default function ProjectHighlights({ highlights }: Props) {
  if (highlights.length === 0) return null;

  return (
    <ul className="space-y-1.5">
      {highlights.map((h) => (
        <li key={h} className="flex items-start gap-2 text-xs text-brand-gray">
          <svg
            className="w-4 h-4 text-brand-olive-500 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span>{h}</span>
        </li>
      ))}
    </ul>
  );
}

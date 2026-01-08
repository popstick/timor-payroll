import { cn } from '@/lib/utils';

interface SearchHighlightProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export function SearchHighlight({
  text,
  query,
  className,
  highlightClassName = 'bg-yellow-200 text-yellow-900 rounded px-0.5',
}: SearchHighlightProps) {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === query.toLowerCase();
        return isMatch ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Hook for filtering and highlighting
export function useSearchFilter<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string
) {
  if (!query.trim()) {
    return { filteredItems: items, hasResults: true };
  }

  const lowerQuery = query.toLowerCase();
  const filteredItems = items.filter((item) =>
    getSearchableText(item).toLowerCase().includes(lowerQuery)
  );

  return {
    filteredItems,
    hasResults: filteredItems.length > 0,
  };
}

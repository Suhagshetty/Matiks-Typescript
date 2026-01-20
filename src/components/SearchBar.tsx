import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LeaderboardRow } from './LeaderboardRow';
import { useUserSearch } from '@/hooks/useLeaderboard';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onUserSelect?: (userId: string) => void;
}

export function SearchBar({ onUserSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { results, loading, search, clearResults } = useUserSearch();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        search(query);
        setIsOpen(true);
      } else {
        clearResults();
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search, clearResults]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    clearResults();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search players by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className={cn(
            'pl-12 pr-12 py-6 text-lg bg-card border-border',
            'focus:ring-2 focus:ring-primary focus:border-primary',
            'placeholder:text-muted-foreground'
          )}
        />
        {loading && (
          <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-spin" />
        )}
        {query && !loading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className={cn(
          'absolute top-full left-0 right-0 mt-2 z-50',
          'bg-card border border-border rounded-xl shadow-xl',
          'max-h-[60vh] overflow-hidden animate-scale-in'
        )}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </span>
              <div className="text-xs text-muted-foreground">
                Global Rank • Username • Rating
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto max-h-[50vh] scrollbar-gaming">
            {results.length === 0 && !loading && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No players found matching "{query}"
              </div>
            )}
            {results.map((user) => (
              <div
                key={user.id}
                onClick={() => onUserSelect?.(user.id)}
                className="cursor-pointer"
              >
                <LeaderboardRow user={user} isHighlighted={false} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

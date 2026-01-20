import { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardRow } from './LeaderboardRow';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 50;

export function LeaderboardTable() {
  const [page, setPage] = useState(0);
  const { users, loading, totalCount, refresh } = useLeaderboard({
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-[80px_1fr_100px] md:grid-cols-[100px_1fr_120px] items-center gap-4 px-4 py-3 bg-secondary/30 rounded-t-xl border-b border-border">
        <div className="text-sm font-semibold text-muted-foreground text-center">Rank</div>
        <div className="text-sm font-semibold text-muted-foreground">Player</div>
        <div className="text-sm font-semibold text-muted-foreground text-right">Rating</div>
      </div>

      {/* Table Body */}
      <div className="min-h-[400px] max-h-[60vh] overflow-y-auto scrollbar-gaming">
        {loading ? (
          // Loading skeleton
          <div className="space-y-2 p-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[80px_1fr_100px] md:grid-cols-[100px_1fr_120px] gap-4 px-4 py-3"
              >
                <div className="h-8 bg-secondary shimmer rounded" />
                <div className="h-8 bg-secondary shimmer rounded" />
                <div className="h-8 bg-secondary shimmer rounded" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg">No players found</p>
            <p className="text-sm mt-1">Database needs to be seeded first</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {users.map((user) => (
              <LeaderboardRow key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 rounded-b-xl border-t border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </Button>
          <span className="text-sm text-muted-foreground">
            {totalCount.toLocaleString()} players
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[100px] text-center">
            Page {page + 1} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1 || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

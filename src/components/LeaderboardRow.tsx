import { RankBadge } from './RankBadge';
import { cn } from '@/lib/utils';
import type { LeaderboardUser } from '@/hooks/useLeaderboard';

interface LeaderboardRowProps {
  user: LeaderboardUser;
  isHighlighted?: boolean;
}

export function LeaderboardRow({ user, isHighlighted = false }: LeaderboardRowProps) {
  const isTopThree = user.global_rank <= 3;
  const isTopTen = user.global_rank <= 10;
  const isTopHundred = user.global_rank <= 100;

  return (
    <div
      className={cn(
        'grid grid-cols-[80px_1fr_100px] md:grid-cols-[100px_1fr_120px] items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200',
        'border border-transparent',
        isHighlighted && 'border-primary/50 bg-primary/10 glow-cyan',
        !isHighlighted && 'row-hover',
        isTopThree && !isHighlighted && 'bg-gradient-to-r from-gold/5 to-transparent',
        isTopTen && !isTopThree && !isHighlighted && 'bg-gradient-to-r from-primary/5 to-transparent'
      )}
    >
      {/* Rank */}
      <div className="flex items-center justify-center">
        {isTopThree ? (
          <RankBadge rank={user.global_rank} size="sm" />
        ) : (
          <span className={cn(
            'font-mono text-lg font-bold',
            isTopTen && 'text-primary text-glow-cyan',
            isTopHundred && !isTopTen && 'text-accent',
            !isTopHundred && 'text-muted-foreground'
          )}>
            #{user.global_rank}
          </span>
        )}
      </div>

      {/* Username */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold uppercase',
          isTopThree && 'bg-gradient-gold text-primary-foreground',
          !isTopThree && 'bg-secondary text-foreground'
        )}>
          {user.username.charAt(0)}
        </div>
        <span className={cn(
          'font-medium truncate',
          isTopThree && 'text-gold',
          isHighlighted && 'text-primary'
        )}>
          {user.username}
        </span>
      </div>

      {/* Rating */}
      <div className="flex items-center justify-end">
        <span className={cn(
          'font-mono font-bold text-lg',
          user.rating >= 4500 && 'text-gold text-glow-gold',
          user.rating >= 4000 && user.rating < 4500 && 'text-primary',
          user.rating >= 3000 && user.rating < 4000 && 'text-accent',
          user.rating < 3000 && 'text-muted-foreground'
        )}>
          {user.rating.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

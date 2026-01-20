import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
  const sizeClasses = {
    sm: 'text-sm w-8 h-8',
    md: 'text-lg w-12 h-12',
    lg: 'text-2xl w-16 h-16'
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 28
  };

  if (rank === 1) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-full bg-gradient-gold glow-gold',
        sizeClasses[size]
      )}>
        <Trophy className="text-primary-foreground" size={iconSizes[size]} />
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-full bg-silver',
        sizeClasses[size]
      )}>
        <Medal className="text-primary-foreground" size={iconSizes[size]} />
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-full bg-bronze',
        sizeClasses[size]
      )}>
        <Award className="text-primary-foreground" size={iconSizes[size]} />
      </div>
    );
  }

  // Regular rank display
  return (
    <div className={cn(
      'flex items-center justify-center rounded-lg bg-secondary font-mono font-bold',
      sizeClasses[size],
      rank <= 10 && 'text-primary',
      rank <= 100 && rank > 10 && 'text-accent'
    )}>
      #{rank}
    </div>
  );
}

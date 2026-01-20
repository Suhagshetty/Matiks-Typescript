import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'gold';
}

export function StatsCard({ title, value, subtitle, icon: Icon, variant = 'default' }: StatsCardProps) {
  return (
    <div className={cn(
      'relative p-6 rounded-xl border border-border bg-gradient-card overflow-hidden',
      variant === 'primary' && 'border-primary/30 glow-cyan',
      variant === 'gold' && 'border-gold/30 glow-gold'
    )}>
      {/* Background glow */}
      <div className={cn(
        'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20',
        variant === 'primary' && 'bg-primary',
        variant === 'gold' && 'bg-gold',
        variant === 'default' && 'bg-accent'
      )} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className={cn(
            'text-3xl font-bold mt-1',
            variant === 'primary' && 'text-primary text-glow-cyan',
            variant === 'gold' && 'text-gold text-glow-gold'
          )}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-lg',
          variant === 'primary' && 'bg-primary/20',
          variant === 'gold' && 'bg-gold/20',
          variant === 'default' && 'bg-secondary'
        )}>
          <Icon className={cn(
            'h-6 w-6',
            variant === 'primary' && 'text-primary',
            variant === 'gold' && 'text-gold',
            variant === 'default' && 'text-muted-foreground'
          )} />
        </div>
      </div>
    </div>
  );
}

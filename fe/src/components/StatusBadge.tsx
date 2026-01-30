import { cn } from '@/lib/utils';
import { AlertLevel, ReportStatus, alertLevelConfig } from '@/lib/mockData';

interface AlertBadgeProps {
  level: AlertLevel;
  pulse?: boolean;
}

export function AlertBadge({ level, pulse = false }: AlertBadgeProps) {
  const config = alertLevelConfig[level];
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.className,
        pulse && level === 'critical' && 'animate-pulse-ring'
      )}
    >
      {(level === 'high' || level === 'critical') && (
        <span className={cn(
          'h-2 w-2 rounded-full',
          level === 'critical' ? 'bg-destructive animate-pulse' : 'bg-orange-500'
        )} />
      )}
      {config.label}
    </span>
  );
}

interface StatusBadgeProps {
  status: ReportStatus | string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, variant, size = 'md' }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    submitted: { label: 'Submitted', className: 'bg-primary/10 text-primary border-primary/20' },
    'in-progress': { label: 'In Progress', className: 'bg-warning/10 text-warning border-warning/20' },
    escalated: { label: 'Escalated', className: 'bg-accent/10 text-accent border-accent/20' },
    resolved: { label: 'Resolved', className: 'bg-success/10 text-success border-success/20' },
  };

  const variantConfig = {
    default: 'bg-muted text-muted-foreground border-border',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  };

  const sizeConfig = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const config = statusConfig[status];
  const variantClass = variant ? variantConfig[variant] : config?.className || variantConfig.default;

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-medium border capitalize',
      sizeConfig[size],
      variantClass
    )}>
      {config?.label || status}
    </span>
  );
}

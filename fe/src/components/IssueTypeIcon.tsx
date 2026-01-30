import { Construction, Droplets, Trash2, Zap } from 'lucide-react';
import { IssueType, issueTypeConfig } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface IssueTypeIconProps {
  type: IssueType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const iconComponents = {
  road: Construction,
  water: Droplets,
  garbage: Trash2,
  power: Zap,
};

export function IssueTypeIcon({ type, size = 'md', showLabel = false }: IssueTypeIconProps) {
  const config = issueTypeConfig[type];
  const Icon = iconComponents[type];

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const containerSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const bgClasses = {
    road: 'bg-orange-500/10',
    water: 'bg-blue-500/10',
    garbage: 'bg-green-500/10',
    power: 'bg-yellow-500/10',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'rounded-lg flex items-center justify-center',
        containerSizes[size],
        bgClasses[type]
      )}>
        <Icon className={cn(sizeClasses[size], config.color)} />
      </div>
      {showLabel && (
        <span className="font-medium">{config.label}</span>
      )}
    </div>
  );
}

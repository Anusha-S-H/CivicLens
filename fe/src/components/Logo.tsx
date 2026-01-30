import { Eye } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-xl gradient-primary flex items-center justify-center shadow-glow`}>
          <Eye className="h-1/2 w-1/2 text-primary-foreground" />
        </div>
        <div className="absolute -inset-1 rounded-xl gradient-primary opacity-30 blur-sm -z-10" />
      </div>
      {showText && (
        <span className={`font-bold ${textClasses[size]} gradient-text`}>
          CivicLens
        </span>
      )}
    </div>
  );
}

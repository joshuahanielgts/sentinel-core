import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  linkTo?: string;
  showText?: boolean;
}

export function SentinelLogo({
  size = 'md',
  className,
  linkTo = '/',
  showText = true,
}: LogoProps) {
  const sizes = {
    sm: { icon: 'w-4 h-4', text: 'text-sm', gap: 'gap-1.5' },
    md: { icon: 'w-5 h-5', text: 'text-base', gap: 'gap-2' },
    lg: { icon: 'w-7 h-7', text: 'text-xl', gap: 'gap-2.5' },
  };

  const s = sizes[size];

  const content = (
    <div className={cn('flex items-center whitespace-nowrap shrink-0', s.gap)}>
      <div className="relative">
        <Shield className={cn(s.icon, 'text-primary')} strokeWidth={1.5} />
        <div className={cn(s.icon, 'absolute inset-0 text-primary opacity-30 blur-sm')}>
          <Shield className="w-full h-full" strokeWidth={1.5} />
        </div>
      </div>
      {showText && (
        <span className={cn('font-glitch tracking-wider whitespace-nowrap shrink-0', s.text, className)}>
          <span className="text-primary">SENTINEL</span>
          <span className="text-foreground"> AI</span>
        </span>
      )}
    </div>
  );

  if (linkTo && linkTo.trim().length > 0) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
}

import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline' | 'purple';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    success: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    neutral: 'bg-[#181824] text-slate-300 border border-[#2a2a3c]',
    outline: 'border border-[#2a2a3c] text-slate-300 bg-transparent',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

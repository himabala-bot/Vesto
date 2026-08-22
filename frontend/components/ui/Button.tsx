import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'purple' | 'emerald';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer rounded-xl';

    const variants = {
      primary: 'bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-900/30 border border-purple-500/40 active:scale-[0.98]',
      purple: 'bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-900/30 border border-purple-500/40 active:scale-[0.98]',
      secondary: 'bg-[#181824] text-slate-100 hover:bg-[#232332] border border-[#2a2a3c] active:scale-[0.98]',
      outline: 'border border-[#2a2a3c] bg-transparent text-slate-200 hover:bg-[#181824] hover:border-purple-500/40 hover:text-white',
      ghost: 'text-slate-400 hover:text-slate-100 hover:bg-[#181824]',
      danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 active:scale-[0.98]',
      emerald: 'bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-900/30 border border-purple-500/40 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-1 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{children}</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

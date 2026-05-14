'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong';
  /** show subtle scanline overlay */
  scanline?: boolean;
}

/**
 * Frosted-glass surface with hairline border, subtle inner highlight and
 * an optional scanline overlay. The atomic surface for the entire UI.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', scanline = false, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          variant === 'strong' ? 'glass-strong' : 'glass',
          'overflow-hidden',
          scanline && 'scanline',
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
GlassCard.displayName = 'GlassCard';

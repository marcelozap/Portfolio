'use client';

import Link from 'next/link';
import { forwardRef, type ComponentPropsWithoutRef, type MouseEvent } from 'react';
import { cn, scrollToSection } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'outline';

interface BaseProps {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = BaseProps & ComponentPropsWithoutRef<'button'> & { href?: undefined };
type LinkProps = BaseProps & ComponentPropsWithoutRef<typeof Link> & { href: string };

type GlowButtonProps = ButtonProps | LinkProps;

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  ghost: 'btn',
  outline: 'btn !bg-transparent !border-white/15 hover:!border-accent/40 hover:!bg-white/[0.04]',
};

/**
 * Polymorphic CTA. Renders <Link> when `href` is set, otherwise a <button>.
 * Variants share the same chrome but differ in glow intensity.
 */
export const GlowButton = forwardRef<HTMLElement, GlowButtonProps>(
  ({ variant = 'ghost', className, children, ...props }, ref) => {
    const classes = cn(variantClass[variant], 'group', className);

    if ('href' in props && props.href) {
      const { href, onClick, ...rest } = props;
      const hrefStr = typeof href === 'string' ? href : '';
      const isHash = hrefStr.startsWith('#');
      const onClickWithScroll = (e: MouseEvent<HTMLAnchorElement>) => {
        if (isHash) {
          e.preventDefault();
          scrollToSection(hrefStr.slice(1));
        }
        onClick?.(e);
      };
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          onClick={onClickWithScroll}
          className={classes}
          {...rest}
        >
          <span className="relative z-10 flex items-center gap-2">{children}</span>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-md opacity-0 transition group-hover:opacity-100"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--accent-glow) / 0.12), transparent 70%)',
            }}
          />
        </Link>
      );
    }

    const buttonProps = props as ButtonProps;
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} {...buttonProps}>
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-md opacity-0 transition group-hover:opacity-100"
          style={{
            background: 'linear-gradient(90deg, hsl(var(--accent-glow) / 0.12), transparent 70%)',
          }}
        />
      </button>
    );
  },
);
GlowButton.displayName = 'GlowButton';

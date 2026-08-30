import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Compose Tailwind classes with conflict resolution.
 * Use everywhere instead of string concatenation.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number to [min, max]. */
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Linearly interpolate between two numbers. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Map a value from one range to another. */
export const mapRange = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  outMin + ((v - inMin) * (outMax - outMin)) / (inMax - inMin);

/** Pseudo-random in [min, max]. */
export const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Format a number with thousands separators. */
export const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

/**
 * Smooth-scroll to a section by id with a manual offset so the heading clears
 * the fixed navbar. Mirrors the value set via `scroll-padding-top` in globals.
 */
export function scrollToSection(id: string) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id);
  if (!el) {
    window.location.href = `/#${id}`;
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top, behavior: 'smooth' });
  history.replaceState(null, '', `#${id}`);
}

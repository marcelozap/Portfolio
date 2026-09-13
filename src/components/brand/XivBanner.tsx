import Image from 'next/image';

export function XivBanner({
  locale = 'en',
  priority = false,
  sizes = '(max-width: 768px) calc(100vw - 48px), 896px',
  className = '',
}: {
  locale?: 'en' | 'es';
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <Image
      src="/brand/xiv-mirrored-dragons.png"
      alt={
        locale === 'es'
          ? 'Dos dragones oscuros frente a frente sobre un horizonte dorado.'
          : 'Two charcoal dragons facing inward above a gold horizon.'
      }
      width={2172}
      height={724}
      quality={90}
      priority={priority}
      sizes={sizes}
      className={`block h-auto w-full ${className}`}
      style={{
        mixBlendMode: 'screen',
        maskImage: 'radial-gradient(ellipse, black 35%, transparent 74%)',
      }}
    />
  );
}

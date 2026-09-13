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
      src="/brand/xiv-gold-horizon.png"
      alt={
        locale === 'es'
          ? 'Montañas oscuras y un horizonte dorado.'
          : 'Charcoal mountains and a fine gold horizon.'
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

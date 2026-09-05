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
      src="/brand/xiv-banner-city.png"
      alt={
        locale === 'es'
          ? 'XIV: toro dorado con detalles en azul eléctrico.'
          : 'XIV: a gold bull with electric-blue accents.'
      }
      width={1713}
      height={918}
      quality={90}
      priority={priority}
      sizes={sizes}
      className={`block h-auto w-full ${className}`}
    />
  );
}

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
      src="/brand/xiv-red-skyline.png"
      alt={
        locale === 'es'
          ? 'XIV en rojo, negro y blanco, con el dragón como la I.'
          : 'XIV in red, black and white, with the dragon as the I.'
      }
      width={1774}
      height={887}
      quality={90}
      priority={priority}
      sizes={sizes}
      className={`block h-auto w-full ${className}`}
    />
  );
}

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
      src="/brand/xiv-dragon-world.png"
      alt={
        locale === 'es'
          ? 'El dragón violeta y cian de XIV sobre un fondo negro.'
          : 'XIV’s violet and cyan dragon against a black background.'
      }
      width={1200}
      height={600}
      quality={90}
      priority={priority}
      sizes={sizes}
      className={`block h-auto w-full ${className}`}
    />
  );
}

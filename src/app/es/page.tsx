import { DragonHome } from '@/components/dragon/DragonHome';

export const metadata = {
  title: 'XIV — Yo soy el dragón',
  description:
    'El mundo de Marcelo Zapata: una mirada independiente a los mercados, la tecnología, la música y la creatividad.',
};

export default function SpanishHome() {
  return <DragonHome locale="es" />;
}

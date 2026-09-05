import { DragonHome } from '@/components/dragon/DragonHome';

export const metadata = {
  title: 'XIV — Yo soy el dragón',
  description:
    'XIV: juego de práctica de opciones en desarrollo, investigación de mercados, agentes de análisis e ingeniería de IA de Marcelo Zapata.',
};

export default function SpanishHome() {
  return <DragonHome locale="es" />;
}

import { DragonHome } from '@/components/dragon/DragonHome';

export const metadata = {
  title: 'XIV — Yo soy el dragón',
  description:
    'XIV: trading independiente, investigación de mercados, agentes de análisis y herramientas personales de Marcelo Zapata.',
};

export default function SpanishHome() {
  return <DragonHome locale="es" />;
}

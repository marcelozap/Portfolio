import { DragonHome } from '@/components/dragon/DragonHome';

export const metadata = {
  title: 'Marcelo Zapata — Ingeniería de software | IA y automatización',
  description:
    'Ingeniero de software graduado de Florida State University. Aplicaciones, IA, integraciones empresariales, automatización y Rally, una próxima aplicación de tenis.',
};

export default function SpanishHome() {
  return <DragonHome locale="es" />;
}

import { DragonHome } from '@/components/dragon/DragonHome';

export const metadata = {
  title: 'Marcelo Zapata — Ingeniería de software | Automatización y calidad',
  description:
    'Marcelo Zapata: automatización de procesos e informes, validación de datos y pruebas manuales y automatizadas. Power Platform, SQL y Azure.',
};

export default function SpanishHome() {
  return <DragonHome locale="es" />;
}

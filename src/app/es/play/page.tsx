import { DragonTape } from '@/components/play/DragonTape';

export const metadata = {
  title: 'Dragon Tape — una canción, una sesión',
  description:
    'Una tesis. Un plan de riesgo. Practica al alza o a la baja con precios ficticios y fondos virtuales. Revisa la sesión. Las operaciones reales y el diario de Marcelo están en MaloSound.ai.',
};

export default function SpanishPlayPage() {
  return <DragonTape locale="es" />;
}

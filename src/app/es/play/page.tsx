import { DragonTape } from '@/components/play/DragonTape';

export const metadata = {
  title: 'Dragon Scales — una canción, una sesión',
  description:
    'Una tesis. Un plan de riesgo. Practica al alza o a la baja con precios ficticios y fondos virtuales. Revisa la sesión. MaloSound.ai reproduce el precio como sonido y movimiento.',
};

export default function SpanishPlayPage() {
  return <DragonTape locale="es" />;
}

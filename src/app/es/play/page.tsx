import { DragonTape } from '@/components/play/DragonTape';

export const metadata = {
  title: 'Dragon Tape — juego de práctica',
  description:
    'Un juego de práctica en vivo: precios ficticios, fondos virtuales, botones grandes y atajos de teclado. Llega a +14% para desbloquear apostar a la baja. Corre por completo en tu navegador.',
};

export default function SpanishPlayPage() {
  return <DragonTape locale="es" />;
}

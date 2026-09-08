import { DragonTape } from '@/components/play/DragonTape';

export const metadata = {
  title: 'Dragon Tape — juego de práctica',
  description:
    'Practica al alza o a la baja con precios ficticios y fondos virtuales. Empieza con 1 contrato; desbloquea más tamaño al aumentar tu capital máximo. Todo en tu navegador.',
};

export default function SpanishPlayPage() {
  return <DragonTape locale="es" />;
}

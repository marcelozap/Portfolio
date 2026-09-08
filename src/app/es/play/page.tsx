import { PracticeGame } from '@/components/play/PracticeGame';

export const metadata = {
  title: 'Juego de práctica',
  description:
    'Un ciclo gratuito para practicar decisiones con opciones: precios ficticios, fondos simulados, recibos sellados y un diario. Corre por completo en tu navegador.',
};

export default function SpanishPlayPage() {
  return <PracticeGame locale="es" />;
}

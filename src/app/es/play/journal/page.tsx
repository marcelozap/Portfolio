import { PracticeGame } from '@/components/play/PracticeGame';

export const metadata = {
  title: 'Juego de diario',
  description:
    'El ciclo de práctica más pausado: precios ficticios, fondos simulados, recibos sellados y un diario. Corre por completo en tu navegador.',
};

export default function SpanishPlayJournalPage() {
  return <PracticeGame locale="es" />;
}

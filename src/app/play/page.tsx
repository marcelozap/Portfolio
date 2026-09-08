import { DragonTape } from '@/components/play/DragonTape';

export const metadata = {
  title: 'Dragon Tape — practice game',
  description:
    'Practice long or short with fictional prices and virtual funds. Start at 1 contract; unlock larger sizes as your best equity grows. Runs entirely in your browser.',
};

export default function PlayPage() {
  return <DragonTape />;
}

import { PracticeGame } from '@/components/play/PracticeGame';

export const metadata = {
  title: 'Practice game',
  description:
    'A free options practice loop: fictional prices, simulated funds, sealed receipts, and a journal. Runs entirely in your browser.',
};

export default function PlayPage() {
  return <PracticeGame />;
}

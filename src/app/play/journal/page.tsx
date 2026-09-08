import { PracticeGame } from '@/components/play/PracticeGame';

export const metadata = {
  title: 'Journal game',
  description:
    'The slower practice loop: fictional prices, simulated funds, sealed receipts, and a journal. Runs entirely in your browser.',
};

export default function PlayJournalPage() {
  return <PracticeGame />;
}

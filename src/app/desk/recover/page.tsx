import type { Metadata } from 'next';
import { DeskPasswordRecovery } from '@/components/desk/DeskPasswordRecovery';
import '../desk.css';

export const metadata: Metadata = {
  title: 'Reset password | XIV',
  description: 'Recover access to your private desk.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function DeskRecoveryPage() {
  return <DeskPasswordRecovery />;
}

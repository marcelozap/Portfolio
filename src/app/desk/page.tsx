import type { Metadata } from 'next';
import { DeskGate } from '@/components/desk/DeskGate';
import './desk.css';

export const metadata: Metadata = {
  title: 'Private desk | XIV',
  description: 'Private workspace for your trading thoughts and preparation drafts.',
  robots: { index: false, follow: false },
};

export default function DeskPage() {
  return <DeskGate />;
}

import type { Metadata } from 'next';
import { DeskGate } from '@/components/desk/DeskGate';
import './desk.css';

export const metadata: Metadata = {
  title: 'Private desk | XIV',
  description: 'Private research requests, agent status and sourced results.',
  robots: { index: false, follow: false },
};

export default function DeskPage() {
  return <DeskGate />;
}

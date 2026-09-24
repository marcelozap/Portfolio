import type { Metadata } from 'next';
import { DeskGate } from '@/components/desk/DeskGate';
import '../desk.css';

export const metadata: Metadata = {
  title: 'Saved notes | XIV',
  description: 'Existing private thoughts and preparation drafts.',
  robots: { index: false, follow: false },
};

export default function SavedNotesPage() {
  return <DeskGate workspace="notes" />;
}

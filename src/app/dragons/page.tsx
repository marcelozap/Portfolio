import type { Metadata } from 'next';
import { DragonCollection } from '@/components/dragon/DragonHome';
export const metadata: Metadata = {
  title: 'The dragons | XIV',
  description: 'Milo, Mika and Money. The dragons of XIV.',
};
export default function DragonsPage() {
  return <DragonCollection />;
}

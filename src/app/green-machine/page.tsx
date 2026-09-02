import { permanentRedirect } from 'next/navigation';

export default function LegacyGreenMachinePage() {
  permanentRedirect('/systems/xiv');
}

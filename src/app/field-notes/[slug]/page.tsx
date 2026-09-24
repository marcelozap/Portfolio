import { permanentRedirect } from 'next/navigation';

export default async function LegacyFieldNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  permanentRedirect(`/ai-blog/${(await params).slug}`);
}

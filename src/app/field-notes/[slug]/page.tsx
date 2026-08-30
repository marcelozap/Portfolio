import { permanentRedirect } from 'next/navigation';

export default function LegacyFieldNotePage({ params }: { params: { slug: string } }) {
  permanentRedirect(`/ai-blog/${params.slug}`);
}

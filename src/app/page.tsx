import { Hero } from '@/components/hero/Hero';
import { AIBlog } from '@/components/sections/AIBlog';
import { Experience } from '@/components/sections/Experience';
import { Offers } from '@/components/sections/Offers';

export default function Home() {
  return (
    <>
      <Hero />
      <Experience />
      <Offers />
      <AIBlog />
    </>
  );
}

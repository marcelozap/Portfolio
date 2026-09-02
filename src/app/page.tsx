import { About } from '@/components/sections/About';
import { AIBlog } from '@/components/sections/AIBlog';
import { Contact } from '@/components/sections/Contact';
import { Hero } from '@/components/hero/Hero';
import { ProjectShowcase } from '@/components/sections/ProjectShowcase';

export default function Home() {
  return (
    <>
      <Hero />
      <ProjectShowcase />
      <About />
      <AIBlog />
      <Contact />
    </>
  );
}

import { Hero } from '@/components/hero/Hero';
import { About } from '@/components/sections/About';
import { Experience } from '@/components/sections/Experience';
import { Music } from '@/components/sections/Music';
import { Projects } from '@/components/projects/Projects';

export default function Home() {
  return (
    <>
      <Hero />
      <Experience />
      <Projects />
      <Music />
      <About />
    </>
  );
}

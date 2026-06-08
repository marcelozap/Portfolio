import { Hero } from '@/components/hero/Hero';
import { About } from '@/components/sections/About';
import { Experience } from '@/components/sections/Experience';
import { Projects } from '@/components/projects/Projects';
import { Music } from '@/components/sections/Music';

export default function Home() {
  return (
    <>
      <Hero />
      <Experience />
      <Projects />
      <About />
      <Music />
    </>
  );
}

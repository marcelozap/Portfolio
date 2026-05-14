import { Hero } from '@/components/hero/Hero';
import { About } from '@/components/sections/About';
import { Experience } from '@/components/sections/Experience';
import { Engineering } from '@/components/sections/Engineering';
import { Projects } from '@/components/projects/Projects';
import { Music } from '@/components/sections/Music';
import { Mirror } from '@/components/sections/Mirror';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Engineering />
      <Projects />
      <Music />
      <Mirror />
    </>
  );
}

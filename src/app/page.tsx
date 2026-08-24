import { Hero } from '@/components/hero/Hero';
import { About } from '@/components/sections/About';
import { Experience } from '@/components/sections/Experience';
import { MaloSound } from '@/components/sections/MaloSound';
import { Offers } from '@/components/sections/Offers';
import { Systems } from '@/components/sections/Systems';
import { Projects } from '@/components/projects/Projects';

export default function Home() {
  return (
    <>
      <Hero />
      <Offers />
      <Systems />
      <Experience />
      <Projects />
      <About />
      <MaloSound />
    </>
  );
}

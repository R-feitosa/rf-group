import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import About from './components/About';
import Units from './components/Units';
import Numbers from './components/Numbers';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { useMagnetic } from './hooks/useMagnetic';
import { bindMotion, prefersReducedMotion } from './three/motion';

export default function App() {
  const [ready, setReady] = useState(false);
  const progress = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  useMagnetic();

  useEffect(() => {
    bindMotion();
    const t = setTimeout(() => { setReady(true); document.body.classList.add('ready'); }, 1500);
    const reduce = prefersReducedMotion();

    // barra de progresso + parallax do hero e dos visuais das empresas
    const onScroll = () => {
      const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      if (reduce) return;
      const stage = document.getElementById('stage');
      if (stage && y < innerHeight * 1.2) stage.style.translate = `0 ${y * 0.12}px`;
      document.querySelectorAll<HTMLElement>('.visual').forEach((v) => {
        const r = v.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) v.style.setProperty('translate', `0 ${((r.top + r.height / 2 - innerHeight / 2) / innerHeight) * -28}px`);
      });
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // brilho que segue o cursor
    const onMove = (e: PointerEvent) => {
      const g = glow.current;
      if (!g) return;
      g.style.opacity = '1'; g.style.left = `${e.clientX}px`; g.style.top = `${e.clientY}px`;
    };
    if (matchMedia('(pointer:fine)').matches && !reduce) addEventListener('pointermove', onMove, { passive: true });

    return () => { clearTimeout(t); removeEventListener('scroll', onScroll); removeEventListener('pointermove', onMove); };
  }, []);

  return (
    <>
      <div id="progress" ref={progress} />
      <div id="glow" ref={glow} />
      <div id="pre" aria-hidden="true">
        <div className="mark"><span>RFEITOSA</span>&nbsp;<span style={{ animationDelay: '.12s' }}>Group</span></div>
        <div className="bar"><i /></div>
      </div>
      <Header />
      <main id="topo">
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Units />
        <Numbers />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

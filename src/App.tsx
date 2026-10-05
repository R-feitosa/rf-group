import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import About from './components/About';
import Units from './components/Units';
import Numbers from './components/Numbers';
import Clients from './components/Clients';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { useMagnetic } from './hooks/useMagnetic';
import FlyLayer from './three/FlyLayer';
import AcademyLanding from './landing/AcademyLanding';
import ValleyLanding from './landing/ValleyLanding';
import ImoveisLanding from './landing/ImoveisLanding';
import { prepareLanding } from './landing/controller';
import { scheduleWarm } from './three/warm';
import { bindMotion, prefersReducedMotion } from './three/motion';
import { flight } from './three/flight';
import { prebuildLogos } from './three/logos';
import { startWarm } from './three/warm';

export default function App() {
  const [ready, setReady] = useState(false);
  const progress = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  useMagnetic();

  useEffect(() => {
    bindMotion();
    const t = setTimeout(() => { setReady(true); document.body.classList.add('ready'); }, 1500);
    // depois da abertura, prepara em segundo plano todas as logos e canvases 3D
    const w = setTimeout(() => { prebuildLogos(); startWarm(); }, 3200);
    // explosão da Academy preparada em segundo plano, depois dos canvases
    const cancelPrep = scheduleWarm(() => prepareLanding('connect-academy'));
    const cancelPrep2 = scheduleWarm(() => prepareLanding('connect-valley'));
    const cancelPrep3 = scheduleWarm(() => prepareLanding('feitosa-imobiliarias'));
    const reduce = prefersReducedMotion();

    // barra de progresso + parallax do hero e dos visuais das empresas
    const onScroll = () => {
      const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      if (reduce || flight.get()) return; // durante o voo a rolagem é controlada: sem parallax
      const stage = document.getElementById('stage');
      if (stage && y < innerHeight * 1.2) stage.style.translate = `0 ${y * 0.12}px`;
      // lê todas as posições antes de escrever (evita reflow forçado a cada elemento)
      const vs = [...document.querySelectorAll<HTMLElement>('.visual')];
      const rs = vs.map((v) => v.getBoundingClientRect());
      vs.forEach((v, i) => {
        const r = rs[i];
        if (r.bottom > 0 && r.top < innerHeight) v.style.translate = `0 ${((r.top + r.height / 2 - innerHeight / 2) / innerHeight) * -28}px`;
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

    return () => { clearTimeout(t); clearTimeout(w); cancelPrep(); cancelPrep2(); cancelPrep3(); removeEventListener('scroll', onScroll); removeEventListener('pointermove', onMove); };
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
        <Clients />
        <Contact />
      </main>
      <Footer />
      <FlyLayer />
      <AcademyLanding />
      <ValleyLanding />
      <ImoveisLanding />
    </>
  );
}

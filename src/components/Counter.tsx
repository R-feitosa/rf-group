import { useEffect, useRef, useState } from 'react';
import type { Stat } from '../data';
import { prefersReducedMotion } from '../three/motion';

const fmt = (v: number, d: number) => (d ? v.toFixed(d).replace('.', ',') : Math.round(v).toLocaleString('pt-BR'));

/** Número que conta de 0 até o valor final quando aparece na tela. */
export default function Counter({ value, prefix = '', suffix = '', decimals = 0 }: Stat) {
  const ref = useRef<HTMLElement>(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (prefersReducedMotion()) return setV(value);
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min((t - t0) / 1900, 1);
        setV(value * (1 - Math.pow(1 - p, 4)));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);
  return <b ref={ref}>{prefix + fmt(v, decimals) + suffix}</b>;
}

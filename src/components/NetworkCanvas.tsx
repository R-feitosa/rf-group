import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../three/motion';
import { flight } from '../three/flight';

/** Rede de partículas conectadas no fundo do hero; foge do cursor. */
export default function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const cx = cv.getContext('2d')!;
    const reduce = prefersReducedMotion();
    let W = 0, H = 0, raf = 0, vis = true;
    let pts: { x: number; y: number; vx: number; vy: number }[] = [];
    const mouse = { x: -999, y: -999 };
    const size = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio, 2);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, (W * H) / 16000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28 }));
    };
    const draw = () => {
      if (!vis) return;
      // durante o voo o hero fica coberto: não gasta quadro com a rede
      if (flight.get()) { raf = requestAnimationFrame(draw); return; }
      cx.clearRect(0, 0, W, H);
      for (const p of pts) {
        if (!reduce) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 140 && d > 0 && !reduce) { p.x += (dx / d) * 0.6; p.y += (dy / d) * 0.6; }
        cx.fillStyle = 'rgba(201,205,240,.65)'; cx.beginPath(); cx.arc(p.x, p.y, 1.5, 0, 7); cx.fill();
      }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) { cx.strokeStyle = `rgba(201,205,240,${0.22 * (1 - d / 130)})`; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke(); }
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    const onMove = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    size();
    addEventListener('resize', size);
    cv.parentElement!.addEventListener('pointermove', onMove);
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; cancelAnimationFrame(raf); if (vis) draw(); });
    io.observe(cv);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener('resize', size); cv.parentElement?.removeEventListener('pointermove', onMove); };
  }, []);
  return <canvas id="net" ref={ref} aria-hidden="true" />;
}

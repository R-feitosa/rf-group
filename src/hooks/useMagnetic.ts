import { useEffect } from 'react';
import { prefersReducedMotion } from '../three/motion';

/** Botões `.mag` atraídos pelo cursor e cards `.card` com tilt 3D (apenas ponteiro fino). */
export function useMagnetic() {
  useEffect(() => {
    if (!matchMedia('(pointer:fine)').matches || prefersReducedMotion()) return;
    const offs: (() => void)[] = [];
    const bind = (el: HTMLElement, move: (e: PointerEvent) => void) => {
      const leave = () => (el.style.transform = '');
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      offs.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); });
    };
    document.querySelectorAll<HTMLElement>('.mag').forEach((b) =>
      bind(b, (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
      }),
    );
    document.querySelectorAll<HTMLElement>('.card').forEach((c) =>
      bind(c, (e) => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
      }),
    );
    return () => offs.forEach((f) => f());
  }, []);
}

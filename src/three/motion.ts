// Estado global de ponteiro e scroll compartilhado por todas as cenas 3D (um listener só).
export const pointer = { x: -9999, y: -9999 };
export const scroll = { y: 0, velocity: 0 };

let bound = false;
export function bindMotion() {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  pointer.x = innerWidth / 2;
  pointer.y = innerHeight / 2;
  addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
  scroll.y = scrollY;
  const tick = () => {
    const y = scrollY;
    scroll.velocity += (y - scroll.y - scroll.velocity) * 0.2;
    scroll.y = y;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

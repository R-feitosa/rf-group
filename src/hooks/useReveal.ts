import { useEffect, useRef } from 'react';

/** Adiciona a classe `in` ao elemento quando ele entra na tela (uma única vez). */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add('in');
        io.disconnect();
      },
      { threshold: 0.18, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

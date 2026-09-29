import { useSyncExternalStore } from 'react';
import type { LogoKey } from './logos';

/**
 * Voo de uma logo do hero até a seção da empresa.
 * `from` é o medalhão na tela (centro e raio em px, rotação atual) no momento do clique.
 */
export type Flight = {
  id: number;
  logo: LogoKey;
  targetId: string;
  from: { x: number; y: number; r: number; rotY: number };
  /** 'travel' = página rolando até a empresa (hero e fundo pausam) */
  phase: 'expand' | 'travel';
  landed: boolean;
};

let current: Flight | null = null;
let startedAt = 0;
let seq = 0;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const flight = {
  get: () => current,
  start(f: Omit<Flight, 'id' | 'landed' | 'phase'>) {
    // trava de segurança: um voo "preso" (aba em segundo plano, erro de GPU) não bloqueia novos cliques
    if (current && performance.now() - startedAt < 6000) return;
    startedAt = performance.now();
    current = { ...f, id: ++seq, phase: 'expand', landed: false };
    emit();
  },
  travel() {
    if (!current || current.phase === 'travel') return;
    current = { ...current, phase: 'travel' };
    emit();
  },
  land() {
    if (!current) return;
    current = { ...current, landed: true };
    emit();
  },
  end() {
    current = null;
    emit();
  },
  subscribe(fn: () => void) {
    subs.add(fn);
    return () => { subs.delete(fn); };
  },
};

export const useFlight = () => useSyncExternalStore(flight.subscribe, flight.get, () => null);

/** Raio do medalhão como fração da metade do lado do canvas de <Logo3D> (fov 30°, distância 0,22). */
export const MEDAL_FILL = 0.05 / (0.22 * Math.tan((15 * Math.PI) / 180));

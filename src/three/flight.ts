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
  landed: boolean;
};

let current: Flight | null = null;
let seq = 0;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const flight = {
  get: () => current,
  start(f: Omit<Flight, 'id' | 'landed'>) {
    if (current) return;
    current = { ...f, id: ++seq, landed: false };
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

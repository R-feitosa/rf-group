import { useSyncExternalStore } from 'react';
import type { LogoKey } from '../three/logos';

/**
 * Landing "escondida" de uma marca: fica na mesma URL e só aparece ao clicar na logo.
 * phase: opening (explodindo/abrindo) → open → closing (fechando/remontando) → null.
 */
export type LandingState = { key: LogoKey; x: number; y: number; phase: 'opening' | 'open' | 'closing' } | null;

let state: LandingState = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const landing = {
  get: () => state,
  set(s: LandingState) { state = s; emit(); },
  patch(p: Partial<NonNullable<LandingState>>) { if (state) { state = { ...state, ...p }; emit(); } },
  subscribe(fn: () => void) { subs.add(fn); return () => { subs.delete(fn); }; },
};

export const useLanding = () => useSyncExternalStore(landing.subscribe, landing.get, () => null);

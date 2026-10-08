import { landing } from './store';
import type { LogoKey } from '../three/logos';
import { device } from '../three/device';
import { prefersReducedMotion } from '../three/motion';

// cor das faíscas/onda de choque: contrasta com o fundo da landing (amarelo do folder → azul da marca)
const SPARK: Partial<Record<LogoKey, string>> = { 'connect-academy': '#1c4fd6', 'connect-valley': '#f6ce54', 'feitosa-imobiliarias': '#e3c25a', 'feitosa-advogados': '#d9b46a', 'eco-solucoes': '#3a3a3a' };
// marcas cuja moeda, ao explodir, se reconstrói como labirinto 3D
const MAZE = new Set<LogoKey>(['eco-solucoes']);
let origin: HTMLElement | null = null;
/** sem explosão (movimento reduzido ou aparelho fraco): a landing só abre */
export const lite = () => prefersReducedMotion() || device.lowEnd;
// o módulo da explosão (three + shader) só é carregado quando necessário
let fxMod: typeof import('../three/explode') | null = null;
const explode = () => import('../three/explode').then((m) => (fxMod = m));
// a landing da Eco recebe o labirinto montado como fundo
const mazeHost = () => document.querySelector<HTMLElement>('.land.active [data-maze-host]');

/** Abre a landing escondida da marca a partir da logo clicada (explosão + revelação em círculo). */
export function openLanding(key: LogoKey, el: HTMLElement) {
  if (landing.get()) return;
  origin = el;
  const r = el.getBoundingClientRect();
  landing.set({ key, x: r.left + r.width / 2, y: r.top + r.height / 2, phase: 'opening' });
  // mesma URL: só uma entrada no histórico para o "voltar" do navegador fechar a landing
  history.pushState({ rfLanding: key }, '', location.href);
  if (lite()) {
    requestAnimationFrame(() => landing.patch({ phase: 'open' }));
    return;
  }
  explode().then(({ play }) =>
    play({ key, el, spark: SPARK[key], maze: MAZE.has(key), mazeHost, onBurst: () => landing.patch({ phase: 'open' }) }),
  ).catch(() => landing.patch({ phase: 'open' }));
}

/** Fecha a landing: recolhe o círculo e remonta a logo no lugar de origem. */
export function closeLanding(fromHistory = false) {
  const s = landing.get();
  if (!s || s.phase !== 'open') return;
  landing.patch({ phase: 'closing' });
  if (!fromHistory && history.state?.rfLanding) history.back();
  const done = () => { landing.set(null); origin?.focus({ preventScroll: true }); };
  setTimeout(() => {
    if (lite() || !origin) { fxMod?.releaseMaze(); return done(); }
    explode().then(({ play }) => play({ key: s.key, el: origin!, reverse: true, onDone: done })).catch(done);
  }, 380);
}

addEventListener('popstate', () => closeLanding(true));

/** Pré-prepara a explosão da marca em momento ocioso (evita travada no clique). */
export function prepareLanding(key: LogoKey) {
  if (lite()) return;
  explode().then(({ prepare }) => prepare(key, SPARK[key], MAZE.has(key)));
}

import { useSyncExternalStore } from 'react';
import { UNITS } from '../data';
import { landing, type LandingState } from '../landing/store';
import { openLanding, closeLanding } from '../landing/controller';
import { flight } from '../three/flight';

/**
 * Apresentação automática do site (mesma URL; ?modo=loop ou ?modo=estande):
 * rola a página, abre o folder escondido de cada empresa (com a explosão), percorre-o, fecha e segue — em loop.
 *
 * - "loop": para quem está vendo no próprio aparelho. Qualquer clique, toque, rolagem ou tecla pausa;
 *   a pessoa retoma pelo botão.
 * - "estande": TV/totem de evento. Tela cheia, cursor escondido, tela sem apagar, links externos bloqueados.
 *   Se alguém interagir, pausa e retoma sozinha depois de IDLE_MS sem interação (recomeçando do topo).
 */
export type TourMode = 'loop' | 'estande';
export type TourState = {
  mode: TourMode | null;
  status: 'off' | 'arming' | 'running' | 'paused';
  /** estande pausado: quando a apresentação volta sozinha (ms, Date.now) */
  resumeAt: number;
  /** aviso curto (ex.: link bloqueado no estande) */
  toast: string;
};

export const IDLE_MS = 30000; // estande: volta a apresentar após 30 s sem interação
const ARM_MS = 10000; // estande aberto pela URL: começa sozinho em 10 s se ninguém tocar (TV que religou)

let state: TourState = { mode: null, status: 'off', resumeAt: 0, toast: '' };
const subs = new Set<() => void>();
const set = (p: Partial<TourState>) => { state = { ...state, ...p }; subs.forEach((f) => f()); };
export const tour = {
  get: () => state,
  subscribe(fn: () => void) { subs.add(fn); return () => { subs.delete(fn); }; },
};
export const useTour = () => useSyncExternalStore(tour.subscribe, tour.get, () => state);

// ---------- utilidades com cancelamento ----------
class Cancelled extends Error {}
const sleep = (ms: number, sig: AbortSignal) => new Promise<void>((res, rej) => {
  if (sig.aborted) return rej(new Cancelled());
  const t = setTimeout(res, ms);
  sig.addEventListener('abort', () => { clearTimeout(t); rej(new Cancelled()); }, { once: true });
});
const frame = (sig: AbortSignal) => new Promise<number>((res, rej) => {
  if (sig.aborted) return rej(new Cancelled());
  requestAnimationFrame(res);
});
/** Espera o estado da landing satisfazer `ok` (ou o tempo-limite, para nunca travar o loop). */
const waitLanding = (ok: (s: LandingState) => boolean, sig: AbortSignal, timeout = 15000) => new Promise<void>((res, rej) => {
  if (ok(landing.get())) return res();
  const done = () => { off(); clearTimeout(t); };
  const off = landing.subscribe(() => { if (ok(landing.get())) { done(); res(); } });
  const t = setTimeout(() => { done(); res(); }, timeout);
  sig.addEventListener('abort', () => { done(); rej(new Cancelled()); }, { once: true });
});
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Rola a página principal até `y` com curva suave (a rolagem do loop não conta como interação). */
async function scrollMain(y: number, sig: AbortSignal) {
  const from = scrollY, to = Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight));
  const d = to - from;
  if (Math.abs(d) < 4) return;
  const dur = Math.min(3200, 900 + Math.abs(d) * 0.45);
  const t0 = performance.now();
  for (;;) {
    const now = await frame(sig);
    const k = Math.min(1, (now - t0) / dur);
    scrollTo({ top: from + d * ease(k), behavior: 'instant' });
    if (k >= 1) return;
  }
}
const topOf = (el: Element) => el.getBoundingClientRect().top + scrollY - 70; // abaixo do cabeçalho
const centerOf = (el: Element) => { const r = el.getBoundingClientRect(); return r.top + scrollY + r.height / 2 - innerHeight / 2; };

/** Percorre a landing aberta de cima a baixo em velocidade constante (máx. ~32 s por folder). */
async function scrollLanding(root: HTMLElement, sig: AbortSignal) {
  const max = () => root.scrollHeight - root.clientHeight;
  const speed = Math.max(70, max() / 32); // px/s
  let pos = root.scrollTop, last = performance.now();
  while (pos < max() - 1) {
    const now = await frame(sig);
    pos = Math.min(max(), pos + (speed * (now - last)) / 1000);
    last = now;
    root.scrollTop = pos;
  }
}

/** Fecha o folder que estiver aberto (esperando a explosão terminar, se ainda estiver abrindo). */
async function ensureClosed(sig: AbortSignal) {
  while (flight.get()) await sleep(300, sig); // voo do topo em andamento
  if (!landing.get()) return;
  await waitLanding((s) => !s || s.phase === 'open', sig);
  closeLanding();
  await waitLanding((s) => s === null, sig);
  await sleep(600, sig);
}

// ---------- roteiro ----------
type Step = (sig: AbortSignal) => Promise<void>;
const section = (id: string, dwell: number): Step => async (sig) => {
  const el = document.getElementById(id);
  if (!el) return;
  await scrollMain(topOf(el), sig);
  await sleep(dwell, sig);
};
const unitStep = (u: (typeof UNITS)[number]): Step => async (sig) => {
  const logo = document.querySelector<HTMLElement>(`#${u.id} .logo3d`);
  if (!logo) return;
  await scrollMain(centerOf(logo), sig);
  await sleep(2200, sig);
  openLanding(u.logo, logo);
  await waitLanding((s) => s?.key === u.logo && s.phase === 'open', sig);
  // tempo para a capa entrar (na Eco, o labirinto 3D monta antes do conteúdo)
  await sleep(u.logo === 'eco-solucoes' ? 3400 : 2400, sig);
  const root = document.querySelector<HTMLElement>('.land.active');
  if (root) await scrollLanding(root, sig);
  await sleep(2500, sig);
  closeLanding();
  await waitLanding((s) => s === null, sig);
  await sleep(900, sig);
};
const steps = (): Step[] => [
  async (sig) => { await scrollMain(0, sig); await sleep(7000, sig); }, // topo: logos em órbita
  section('quem-somos', 6000),
  ...UNITS.filter((u) => u.landing).map(unitStep),
  section('numeros', 5000),
  section('clientes', 6000),
  section('contato', 5000),
];

// ---------- execução ----------
let ctrl: AbortController | null = null;
let idx = 0;
let resumeTimer = 0;

async function run() {
  ctrl?.abort();
  const c = (ctrl = new AbortController());
  const list = steps();
  try {
    await ensureClosed(c.signal);
    for (;;) {
      for (; idx < list.length; idx++) {
        try { await list[idx](c.signal); } catch (e) {
          if (e instanceof Cancelled) throw e;
          console.error('[apresentação] etapa falhou; seguindo para a próxima', e); // o estande não pode parar
        }
      }
      idx = 0;
    }
  } catch { /* cancelada: pausa ou saída */ }
}

/** Pausa a apresentação (botão "Pausar"; interações do visitante também pausam). */
export function pauseTour() { if (state.status === 'running') pause(); }

function pause() {
  ctrl?.abort();
  ctrl = null;
  set({ status: 'paused' });
  if (state.mode === 'estande') scheduleResume();
}
function scheduleResume() {
  clearTimeout(resumeTimer);
  set({ resumeAt: Date.now() + IDLE_MS });
  resumeTimer = window.setTimeout(() => { if (state.status === 'paused') resumeTour(); }, IDLE_MS);
}

/** Retoma a apresentação (estande recomeça do topo; loop continua de onde parou). */
export function resumeTour() {
  if (!state.mode) return;
  clearTimeout(resumeTimer);
  if (state.mode === 'estande') idx = 0;
  set({ status: 'running', resumeAt: 0 });
  void run();
}

// ---------- interação do visitante ----------
const isTourUi = (e: Event) => (e.target as Element | null)?.closest?.('[data-tour-ui]');
function onInteract(e: Event) {
  if (isTourUi(e)) return;
  if (state.status === 'running') pause();
  else if (state.status === 'paused' && state.mode === 'estande') scheduleResume();
}
function onMoveStand() {
  if (state.mode !== 'estande') return;
  // estande: cursor some depois de 2,5 s parado; mexer o mouse com a apresentação pausada adia a retomada
  const html = document.documentElement;
  html.classList.remove('stand-idle');
  clearTimeout(cursorTimer);
  cursorTimer = window.setTimeout(() => html.classList.add('stand-idle'), 2500);
  if (state.status === 'paused') scheduleResume();
}
let cursorTimer = 0;
let toastTimer = 0;
function toast(msg: string) {
  set({ toast: msg });
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => set({ toast: '' }), 2800);
}
/** Estande: links que sairiam da página (Instagram, WhatsApp, e-mail, sites) e o formulário ficam desativados. */
function blockExternal(e: Event) {
  if (state.mode !== 'estande') return;
  if (e.type === 'submit') { e.preventDefault(); e.stopPropagation(); toast('No modo estande, fale com a nossa equipe aqui no estande.'); return; }
  const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
  if (!a) return;
  const url = new URL(a.href, location.href);
  if (url.origin === location.origin && !a.target) return; // âncoras internas continuam funcionando
  e.preventDefault();
  e.stopPropagation();
  toast('No modo estande, os links externos ficam desativados.');
}

type WakeLockLike = { release: () => Promise<void> };
let wake: WakeLockLike | null = null;
async function keepAwake() {
  try {
    const wl = (navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLockLike> } }).wakeLock;
    if (wl && document.visibilityState === 'visible') wake = await wl.request('screen');
  } catch { /* sem suporte ou negado: segue sem */ }
}
const onVisible = () => { if (state.mode === 'estande' && document.visibilityState === 'visible') void keepAwake(); };

const EVENTS = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const;
let listening = false;
function listen(on: boolean) {
  if (on === listening) return;
  listening = on;
  const f = (on ? window.addEventListener : window.removeEventListener).bind(window);
  const opt: AddEventListenerOptions = { capture: true, passive: true };
  EVENTS.forEach((t) => f(t, onInteract, opt));
  f('click', blockExternal, true);
  f('submit', blockExternal, true);
  f('pointermove', onMoveStand, opt);
  if (on) document.addEventListener('visibilitychange', onVisible);
  else document.removeEventListener('visibilitychange', onVisible);
}

function setUrl(mode: TourMode | null) {
  const u = new URL(location.href);
  if (mode) u.searchParams.set('modo', mode); else u.searchParams.delete('modo');
  history.replaceState(history.state, '', u);
}

let enteredFullscreen = false;
/** Liga a apresentação. `gesture`: chamado a partir de um clique (permite tela cheia). */
export function startTour(mode: TourMode, gesture = false) {
  clearTimeout(armTimer);
  clearTimeout(resumeTimer); // troca de modo com o estande pausado: cancela a retomada agendada
  if (mode === 'loop') { // saindo do estande para o loop: devolve cursor e libera a tela para apagar
    clearTimeout(cursorTimer);
    document.documentElement.classList.remove('stand-idle');
    void wake?.release().catch(() => {});
    wake = null;
  }
  setUrl(mode);
  listen(true);
  const html = document.documentElement;
  html.classList.toggle('stand', mode === 'estande');
  if (mode === 'estande') {
    if (gesture && !document.fullscreenElement && html.requestFullscreen) {
      html.requestFullscreen().then(() => { enteredFullscreen = true; }).catch(() => {});
    }
    void keepAwake();
    onMoveStand();
  }
  idx = 0;
  set({ mode, status: 'running', resumeAt: 0, toast: '' });
  void run();
}

/** Desliga a apresentação e volta ao site normal. */
export function stopTour() {
  ctrl?.abort();
  ctrl = null;
  clearTimeout(resumeTimer); clearTimeout(armTimer); clearTimeout(cursorTimer);
  listen(false);
  document.documentElement.classList.remove('stand', 'stand-idle');
  void wake?.release().catch(() => {});
  wake = null;
  if (enteredFullscreen && document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  enteredFullscreen = false;
  setUrl(null);
  set({ mode: null, status: 'off', resumeAt: 0, toast: '' });
}

let armTimer = 0;
/** Lê ?modo= ao abrir o site: loop começa direto; estande pede um toque (tela cheia) ou começa sozinho em 10 s. */
export function initTourFromUrl() {
  const m = new URLSearchParams(location.search).get('modo');
  if (m === 'loop') startTour('loop');
  else if (m === 'estande') {
    set({ mode: 'estande', status: 'arming', resumeAt: Date.now() + ARM_MS, toast: '' });
    armTimer = window.setTimeout(() => { if (state.status === 'arming') startTour('estande'); }, ARM_MS);
  }
}

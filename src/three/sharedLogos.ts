// Renderizador compartilhado das logos 3D das seções (e da landing).
//
// Por quê: cada <Canvas> WebGL é um contexto próprio, e o navegador limita quantos uma página pode ter
// (≈8 no Chrome Android). Passando do limite, ele derruba o mais antigo (o do topo fica branco).
// Aqui UM contexto desenha todas as logos visíveis, uma de cada vez, e copia a imagem para o <canvas 2D>
// de cada uma. Resultado: as 6 logos (5 seções + landing) custam 1 contexto em vez de 6.
import * as THREE from 'three';
import { getLogo, R, type LogoKey } from './logos';
import { pointer, scroll, prefersReducedMotion } from './motion';
import { flight } from './flight';
import { device } from './device';
import { pivots } from './pivots';

export type Motion = 'sway' | 'spin' | 'float' | 'none';

const easeOutBack = (t: number) => { const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const DIST = 0.22; // distância da câmera (fov 30°): o medalhão ocupa ~85% da altura

export type LogoItem = {
  logo: LogoKey;
  motion: Motion;
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  scene: THREE.Scene;
  cam: THREE.PerspectiveCamera;
  pivot: THREE.Group;
  /** anima e desenha a cada quadro */
  running: boolean;
  /** já entrou na tela (dispara a animação de entrada) */
  entered: boolean;
  hovered: boolean;
  track: boolean;
  w: number; h: number; // tamanho CSS
  st: { t0: number; flip: number; flipTarget: number; wasHover: boolean; seed: number; n: number; cx: number; cy: number };
  ro: ResizeObserver;
};

let renderer: THREE.WebGLRenderer | null = null;
let bufW = 0, bufH = 0;
const items = new Set<LogoItem>();
let raf = 0;
const reduce = prefersReducedMotion();
const dpr = () => (device.lowEnd ? 1 : Math.min(devicePixelRatio || 1, 1.75));

function getRenderer() {
  if (renderer) return renderer;
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  r.setPixelRatio(1); // trabalhamos direto em pixels de dispositivo
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.setClearColor(0x000000, 0);
  r.setScissorTest(true);
  r.debug.checkShaderErrors = import.meta.env.DEV;
  return (renderer = r);
}

function lights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8580, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(0.6, 0.9, 1.2); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.0); rim.position.set(-1, 0.3, -0.6); scene.add(rim);
}

/** Anima a pose da logo (mesma lógica de antes: entrada, sway/spin/float, mouse, scroll, flip no hover). */
function animate(it: LogoItem, t: number) {
  const p = it.pivot, s = it.st;
  if (reduce || it.motion === 'none') { p.rotation.set(0, 0, 0); p.scale.setScalar(1); return; }
  if (!it.entered) { p.scale.setScalar(0.001); return; }
  // se a logo chegou voando do hero, pula a animação de entrada
  if (s.t0 < 0) s.t0 = flight.get()?.logo === it.logo ? t - 10 : t;
  const k = Math.min((t - s.t0) / 1.6, 1);
  const intro = easeOutBack(k);
  const introSpin = Math.pow(1 - k, 3) * -Math.PI * 3;

  // pointer relativo ao elemento; a posição do elemento é relida só a cada 12 quadros
  if (s.n++ % 12 === 0) {
    const b = it.host.getBoundingClientRect();
    s.cx = b.left + b.width / 2 + scrollX;
    s.cy = b.top + b.height / 2 + scrollY;
  }
  const mx = THREE.MathUtils.clamp(((pointer.x - (s.cx - scrollX)) / innerWidth) * 2, -1, 1);
  const my = THREE.MathUtils.clamp(((pointer.y - (s.cy - scrollY)) / innerHeight) * 2, -1, 1);

  if (it.hovered && !s.wasHover) s.flipTarget += Math.PI * 2;
  s.wasHover = it.hovered;
  s.flip += (s.flipTarget - s.flip) * 0.06;

  const tt = t + s.seed;
  const base = it.motion === 'spin' ? tt * 0.8 : it.motion === 'sway' ? Math.sin(tt * 0.9) * 0.45 : Math.sin(tt * 0.6) * 0.25;
  const targetY = base + mx * 0.35 + introSpin + s.flip;
  const targetX = my * 0.25 + THREE.MathUtils.clamp(scroll.velocity * 0.004, -0.35, 0.35) + Math.sin(tt * 0.7) * 0.06;

  p.rotation.y = it.motion === 'spin' || k < 1 ? targetY : p.rotation.y + (targetY - p.rotation.y) * 0.08;
  p.rotation.x += (targetX - p.rotation.x) * 0.08;
  p.rotation.z = Math.sin(tt * 0.5) * 0.03;
  p.position.y = Math.sin(tt * 1.3) * R * 0.04;
  const sc = p.scale.x + (intro * (it.hovered ? 1.06 : 1) - p.scale.x) * (k < 1 ? 1 : 0.1);
  p.scale.setScalar(Math.max(sc, 0.001));
}

/** Desenha a logo no renderizador compartilhado e copia para o canvas 2D dela. */
function draw(it: LogoItem) {
  const r = getRenderer();
  const d = dpr();
  const pw = Math.max(1, Math.round(it.w * d)), ph = Math.max(1, Math.round(it.h * d));
  if (it.canvas.width !== pw || it.canvas.height !== ph) { it.canvas.width = pw; it.canvas.height = ph; }
  // o buffer compartilhado só cresce (realocar a cada logo seria caro)
  if (pw > bufW || ph > bufH) { bufW = Math.max(bufW, pw); bufH = Math.max(bufH, ph); r.setSize(bufW, bufH, false); }
  const aspect = pw / ph;
  if (it.cam.aspect !== aspect || it.cam.position.z === 0) {
    it.cam.aspect = aspect;
    it.cam.position.set(0, 0, DIST * Math.max(1, 1 / aspect));
    it.cam.updateProjectionMatrix();
  }
  r.setViewport(0, 0, pw, ph);
  r.setScissor(0, 0, pw, ph);
  r.render(it.scene, it.cam);
  // o viewport do WebGL começa embaixo; no canvas 2D a origem é em cima
  it.ctx.clearRect(0, 0, pw, ph);
  it.ctx.drawImage(r.domElement, 0, bufH - ph, pw, ph, 0, 0, pw, ph);
}

function loop() {
  raf = 0;
  const t = performance.now() / 1000;
  let any = false;
  for (const it of items) {
    if (!it.running) continue;
    any = true;
    animate(it, t);
    draw(it);
  }
  if (any) raf = requestAnimationFrame(loop);
}

/** Liga o loop se houver alguma logo rodando. */
export function kick() {
  if (!raf && [...items].some((i) => i.running)) raf = requestAnimationFrame(loop);
}

/** Registra uma logo: cria a cena, compila os shaders e desenha o primeiro quadro (fora da tela). */
export function register(opts: { logo: LogoKey; motion: Motion; host: HTMLElement; canvas: HTMLCanvasElement; track: boolean }): LogoItem {
  const scene = new THREE.Scene();
  lights(scene);
  const pivot = new THREE.Group();
  pivot.add(getLogo(opts.logo));
  scene.add(pivot);
  const it: LogoItem = {
    ...opts,
    ctx: opts.canvas.getContext('2d')!,
    scene, pivot,
    cam: (() => { const c = new THREE.PerspectiveCamera(30, 1, 0.01, 10); c.position.set(0, 0, DIST); return c; })(),
    running: false, entered: false, hovered: false,
    w: opts.host.clientWidth || 1, h: opts.host.clientHeight || 1,
    st: { t0: -1, flip: 0, flipTarget: 0, wasHover: false, seed: Math.random() * 10, n: 0, cx: 0, cy: 0 },
    ro: new ResizeObserver(() => {
      it.w = opts.host.clientWidth || 1; it.h = opts.host.clientHeight || 1;
      if (!it.running) { animate(it, performance.now() / 1000); draw(it); }
    }),
  };
  it.ro.observe(opts.host);
  items.add(it);
  if (opts.track) pivots.set(opts.logo, pivot);
  const r = getRenderer();
  r.compile(scene, it.cam);
  animate(it, performance.now() / 1000);
  draw(it); // conclui a compilação e envia as geometrias à GPU
  return it;
}

export function unregister(it: LogoItem) {
  it.ro.disconnect();
  items.delete(it);
  if (it.track && pivots.get(it.logo) === it.pivot) pivots.delete(it.logo);
}

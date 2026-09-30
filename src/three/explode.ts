// Explosão / remontagem das logos 3D (adaptado de "Logos com explosão 3D", rf-explode.js).
// Camada WebGL fixa em tela cheia, câmera em pixels. Os fragmentos são calculados em segundo plano
// (prepare) para o clique não travar; a animação roda só durante a explosão.
import * as THREE from 'three';
import { buildLogo, R, type LogoKey } from './logos';
import { pivots } from './pivots';

const VIEW_H = 2 * 0.22 * Math.tan((15 * Math.PI) / 180); // altura visível do canvas de <Logo3D>
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

type Ctx = { r: THREE.WebGLRenderer; scene: THREE.Scene; cam: THREE.PerspectiveCamera; dotTex: THREE.CanvasTexture; flash: THREE.PointLight };
let ctx: Ctx | null = null;

function setup(): Ctx {
  if (ctx) return ctx;
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.debug.checkShaderErrors = import.meta.env.DEV;
  r.domElement.className = 'explode-canvas';
  r.domElement.setAttribute('aria-hidden', 'true');
  document.body.appendChild(r.domElement);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8580, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(0.6, 0.9, 1.2); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.0); rim.position.set(-1, 0.3, -0.6); scene.add(rim);
  // luz do "flash" fica sempre na cena (apagada): mudar o nº de luzes obrigaria recompilar os shaders no clique
  const flash = new THREE.PointLight(0xffffff, 0, 0, 2);
  scene.add(flash);
  const cam = new THREE.PerspectiveCamera(30, 1, 1, 20000);
  const resize = () => {
    const w = innerWidth, h = innerHeight;
    r.setSize(w, h, false);
    cam.aspect = w / h;
    cam.position.set(0, 0, h / 2 / Math.tan((15 * Math.PI) / 180));
    cam.updateProjectionMatrix();
  };
  addEventListener('resize', resize);
  resize();
  const dot = document.createElement('canvas'); dot.width = dot.height = 64;
  const g = dot.getContext('2d')!, gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return (ctx = { r, scene, cam, dotTex: new THREE.CanvasTexture(dot), flash });
}

/** Subdivide triângulos grandes para a logo quebrar em pedaços pequenos. */
function subdivide(pos: number[], nor: number[], L: number): [Float32Array, Float32Array] {
  const P: number[] = [], N: number[] = [], stack: [number[], number[]][] = [];
  for (let i = 0; i < pos.length; i += 9) stack.push([pos.slice(i, i + 9), nor.slice(i, i + 9)]);
  const L2 = L * L;
  while (stack.length) {
    const [p, n] = stack.pop()!;
    const d = (a: number, b: number) => (p[a * 3] - p[b * 3]) ** 2 + (p[a * 3 + 1] - p[b * 3 + 1]) ** 2 + (p[a * 3 + 2] - p[b * 3 + 2]) ** 2;
    const e = [d(0, 1), d(1, 2), d(2, 0)], m = Math.max(...e);
    if (m <= L2 || stack.length > 400000) { P.push(...p); N.push(...n); continue; }
    const k = e.indexOf(m), a = k, b = (k + 1) % 3, c = (k + 2) % 3;
    const mp = [0, 1, 2].map((j) => (p[a * 3 + j] + p[b * 3 + j]) / 2);
    let mn = [0, 1, 2].map((j) => (n[a * 3 + j] + n[b * 3 + j]) / 2);
    const l = Math.hypot(...mn) || 1; mn = mn.map((v) => v / l);
    const V = (i: number) => p.slice(i * 3, i * 3 + 3), W = (i: number) => n.slice(i * 3, i * 3 + 3);
    stack.push([[...V(a), ...mp, ...V(c)], [...W(a), ...mn, ...W(c)]]);
    stack.push([[...mp, ...V(b), ...V(c)], [...mn, ...W(b), ...W(c)]]);
  }
  return [new Float32Array(P), new Float32Array(N)];
}

type Built = { group: THREE.Group; mats: THREE.MeshStandardMaterial[] };

/** Constrói a logo fragmentada: cada triângulo recebe um "centro" (semente), direção e giro próprios. */
function build(key: LogoKey, intensity: number): Built {
  const group = buildLogo(key);
  const nSeeds = 46;
  const seeds = Array.from({ length: nSeeds }, () => {
    const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * R * 1.02;
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    const len = Math.hypot(x, y) || 1, sp = rnd(0.12, 0.42) * intensity;
    const ax = [rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)], al = Math.hypot(...ax) || 1;
    return {
      x, y,
      dir: [(x / len) * sp + rnd(-0.06, 0.06), (y / len) * sp + rnd(-0.04, 0.09), rnd(-0.12, 0.3) * intensity],
      rot: [ax[0] / al, ax[1] / al, ax[2] / al, rnd(2, 9) * (Math.random() < 0.5 ? -1 : 1)],
    };
  });
  const mats: THREE.MeshStandardMaterial[] = [];
  group.children.slice().forEach((child) => {
    const mesh = child as THREE.Mesh;
    const g0 = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
    const [pos, nor] = subdivide(Array.from(g0.attributes.position.array), Array.from(g0.attributes.normal.array), R * 0.11);
    const n = pos.length / 3, aC = new Float32Array(n * 3), aD = new Float32Array(n * 3), aR = new Float32Array(n * 4);
    const oz = mesh.position.z;
    for (let t = 0; t < n; t += 3) {
      const cx = (pos[t * 3] + pos[t * 3 + 3] + pos[t * 3 + 6]) / 3, cy = (pos[t * 3 + 1] + pos[t * 3 + 4] + pos[t * 3 + 7]) / 3;
      let best = 0, bd = 1e9;
      for (let s = 0; s < nSeeds; s++) { const dd = (seeds[s].x - cx) ** 2 + (seeds[s].y - cy) ** 2; if (dd < bd) { bd = dd; best = s; } }
      const S = seeds[best];
      for (let v = 0; v < 3; v++) { aC.set([S.x, S.y, -oz], (t + v) * 3); aD.set(S.dir, (t + v) * 3); aR.set(S.rot, (t + v) * 4); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.setAttribute('aCenter', new THREE.BufferAttribute(aC, 3));
    geo.setAttribute('aDir', new THREE.BufferAttribute(aD, 3));
    geo.setAttribute('aRot', new THREE.BufferAttribute(aR, 4));
    const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
    mat.transparent = true;
    mat.side = THREE.DoubleSide;
    const u = { uP: { value: 0 }, uGrav: { value: 0.1 } };
    mat.userData.u = u;
    mat.customProgramCacheKey = () => 'rf-explode';
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, u);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', `#include <common>
attribute vec3 aCenter; attribute vec3 aDir; attribute vec4 aRot; uniform float uP; uniform float uGrav;
vec3 rotAx(vec3 v, vec3 k, float a){ return v*cos(a) + cross(k,v)*sin(a) + k*dot(k,v)*(1.0-cos(a)); }`)
        .replace('#include <beginnormal_vertex>', `float ep = 1.0 - pow(1.0 - uP, 3.0);
vec3 objectNormal = rotAx(normal, aRot.xyz, aRot.w * ep);`)
        .replace('#include <begin_vertex>', `vec3 transformed = aCenter + rotAx(position - aCenter, aRot.xyz, aRot.w * ep) * (1.0 - 0.3 * ep) + aDir * ep + vec3(0.0, -uGrav * uP * uP, 0.0);`);
    };
    mesh.geometry.dispose();
    mesh.geometry = geo;
    mesh.material = mat;
    mats.push(mat);
  });
  return { group, mats };
}

function sparks(color: THREE.Color, intensity: number) {
  const N = 320, p0 = new Float32Array(N * 3), v = new Float32Array(N * 3), pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * R;
    p0.set([Math.cos(a) * rr, Math.sin(a) * rr, 0.004], i * 3);
    const sp = rnd(0.1, 0.7) * intensity, b = Math.random() * Math.PI * 2;
    v.set([Math.cos(b) * sp, Math.sin(b) * sp + 0.03, rnd(0, 0.15)], i * 3);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color, size: 9, map: ctx!.dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const pts = new THREE.Points(geo, mat);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 128),
    new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  const g = new THREE.Group(); g.add(pts, ring);
  const update = (t: number) => {
    const e = 1 - Math.pow(1 - t, 3);
    for (let i = 0; i < N * 3; i += 3) {
      pos[i] = p0[i] + v[i] * e; pos[i + 1] = p0[i + 1] + v[i + 1] * e - 0.12 * t * t; pos[i + 2] = p0[i + 2] + v[i + 2] * e;
    }
    geo.attributes.position.needsUpdate = true;
    mat.opacity = Math.max(0, 1 - t * 1.15); mat.size = 9 * (1 - 0.5 * t);
    const rs = R * (1 + 5 * Math.pow(Math.min(1, t * 1.6), 0.6));
    ring.scale.setScalar(rs); (ring.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 * (1 - t * 1.7));
  };
  return { g, update };
}

// Logos já fragmentadas e com shader compilado, prontas para o clique.
// Os mesmos fragmentos servem para explodir e remontar (nada é recalculado depois do preparo).
const ready = new Map<LogoKey, Built>();

/** Prepara (em momento ocioso) contexto, fragmentos e shader da explosão de uma logo. */
export function prepare(key: LogoKey) {
  if (ready.has(key)) return;
  const { r, scene, cam } = setup();
  const b = build(key, 1);
  // sonda minúscula com a logo fragmentada + faíscas: compila todos os programas usados na explosão
  const fx = sparks(new THREE.Color('#ffffff'), 1);
  const probe = new THREE.Group(); probe.scale.setScalar(0.0001); probe.add(b.group, fx.g);
  scene.add(probe);
  r.compile(scene, cam);
  r.render(scene, cam); // conclui a compilação e envia as geometrias à GPU
  scene.remove(probe);
  probe.remove(b.group);
  fx.g.traverse((x) => { const m = x as THREE.Mesh; m.geometry?.dispose(); (m.material as THREE.Material | undefined)?.dispose?.(); });
  r.clear();
  ready.set(key, b);
}

type PlayOpts = {
  key: LogoKey; el: HTMLElement; reverse?: boolean; spark?: string; intensity?: number; speed?: number;
  onBurst?: () => void; onDone?: () => void;
};

export function play(o: PlayOpts): Promise<void> {
  const { r, scene, cam } = setup();
  prepare(o.key); // no-op se já preparado em segundo plano
  const { group, mats } = ready.get(o.key)!;
  r.domElement.classList.add('on');

  const rect = o.el.getBoundingClientRect();
  const S = rect.height / VIEW_H;
  const cx = rect.left + rect.width / 2 - innerWidth / 2, cy = innerHeight / 2 - (rect.top + rect.height / 2);
  const intensity = o.intensity ?? 1, speed = o.speed ?? 1;
  const holder = new THREE.Group(); holder.position.set(cx, cy, 0); holder.scale.setScalar(S);
  // parte da mesma pose em que a logo da seção estava (giro, inclinação, flutuação)
  const pv = pivots.get(o.key);
  group.rotation.set(pv?.rotation.x ?? 0, pv?.rotation.y ?? 0, pv?.rotation.z ?? 0);
  group.position.y = pv?.position.y ?? 0;
  holder.add(group); scene.add(holder);
  const fx = o.reverse ? null : sparks(new THREE.Color(o.spark || '#ffffff'), intensity);
  if (fx) holder.add(fx.g);
  const light = ctx!.flash;
  light.color.set(o.spark || '#ffffff');
  light.intensity = 0;
  light.position.set(cx, cy, 60);
  const setP = (p: number) => mats.forEach((m) => { m.userData.u.uP.value = p; m.opacity = 1 - Math.max(0, (p - 0.55) / 0.45); });
  const pre = o.reverse ? 0 : 200 / speed, dur = (o.reverse ? 950 : 1700) / speed;
  const t0 = performance.now();
  let burst = false;

  return new Promise((res) => {
    const tick = (now: number) => {
      const el = now - t0;
      if (el < pre) {
        // "tremor" antes de explodir
        const k = el / pre;
        holder.scale.setScalar(S * (1 - 0.1 * k * k));
        holder.position.x = cx + Math.sin(el * 0.9) * 3 * k; holder.position.y = cy + Math.cos(el * 1.3) * 3 * k;
        setP(0); if (fx) fx.g.visible = false;
      } else {
        if (!burst) { burst = true; holder.position.set(cx, cy, 0); if (fx) fx.g.visible = true; o.onBurst?.(); }
        const t = Math.min(1, (el - pre) / dur);
        if (o.reverse) {
          setP(1 - t);
          const e = 1 - Math.pow(1 - t, 3);
          holder.scale.setScalar(S * (1 + 0.06 * Math.sin(Math.PI * Math.min(1, e * 1.05))));
        } else {
          setP(t);
          holder.scale.setScalar(S * (0.9 + 0.2 * Math.min(1, t * 6)));
          fx!.update(t);
          light.intensity = 2e4 * Math.max(0, 1 - t * 3) * intensity;
        }
        if (t >= 1) {
          scene.remove(holder);
          light.intensity = 0;
          holder.remove(group); // fragmentos ficam guardados para a próxima vez
          fx?.g.traverse((x) => {
            const m = x as THREE.Mesh;
            m.geometry?.dispose();
            (m.material as THREE.Material | undefined)?.dispose?.();
          });
          r.render(scene, cam); // limpa
          r.domElement.classList.remove('on');
          o.onDone?.();
          res();
          return;
        }
      }
      r.render(scene, cam);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

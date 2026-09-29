import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Lights, useLogo } from './Logo3D';
import { R } from './logos';
import { flight, MEDAL_FILL, useFlight, type Flight } from './flight';

// Linha do tempo (segundos)
const T_EXPAND = 0.75; // sai da órbita e cresce no centro da tela
const T_HOLD = 1.0; // pausa de destaque
const T_SCROLL = 0.85; // começa a rolar a página
const D_SCROLL = 1.15;
const T_LAND = 2.15; // pousa na área da empresa
const T_FADE = 0.3;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
const lerp = THREE.MathUtils.lerp;

function targetRect(id: string) {
  const el = document.getElementById(id)?.querySelector('.logo3d') ?? document.getElementById(id);
  const b = el!.getBoundingClientRect();
  return { x: b.left + b.width / 2, y: b.top + b.height / 2, r: (Math.min(b.width, b.height) / 2) * MEDAL_FILL, top: b.top + b.height / 2 };
}

function Flyer({ f, veil }: { f: Flight; veil: React.RefObject<HTMLDivElement> }) {
  const g = useLogo(f.logo);
  const ref = useRef<THREE.Group>(null!);
  const st = useRef<{ t0: number; scrollFrom: number; scrollTo: number | null; done: boolean }>({
    t0: performance.now(), scrollFrom: scrollY, scrollTo: null, done: false,
  });

  useFrame(({ size }) => {
    const s = st.current;
    const t = (performance.now() - s.t0) / 1000;
    const o = ref.current;
    const W = size.width, H = size.height;
    const mid = { x: W / 2, y: H / 2, r: Math.min(W, H) * 0.3 };

    // rolagem controlada até centralizar a logo da empresa
    if (t >= T_SCROLL) {
      if (s.scrollTo === null) {
        const max = document.documentElement.scrollHeight - innerHeight;
        s.scrollFrom = scrollY;
        s.scrollTo = Math.min(Math.max(scrollY + targetRect(f.targetId).top - innerHeight / 2, 0), max);
      }
      const k = clamp01((t - T_SCROLL) / D_SCROLL);
      if (k < 1 || Math.abs(scrollY - s.scrollTo) > 1) window.scrollTo({ top: lerp(s.scrollFrom, s.scrollTo, ease(k)), behavior: 'instant' });
    }

    let x: number, y: number, r: number, rotY: number, rotX: number;
    if (t < T_EXPAND) {
      const k = ease(t / T_EXPAND);
      x = lerp(f.from.x, mid.x, k);
      y = lerp(f.from.y, mid.y, k) - Math.sin(k * Math.PI) * H * 0.06; // leve arco
      r = lerp(f.from.r, mid.r, k);
      rotY = lerp(f.from.rotY, Math.PI * 2, k);
      rotX = Math.sin(k * Math.PI) * 0.35;
    } else if (t < T_HOLD) {
      const k = (t - T_EXPAND) / (T_HOLD - T_EXPAND);
      x = mid.x; y = mid.y;
      r = mid.r * (1 + Math.sin(k * Math.PI) * 0.05);
      rotY = Math.PI * 2 + Math.sin(k * Math.PI) * 0.25;
      rotX = 0;
    } else {
      const k = ease(clamp01((t - T_HOLD) / (T_LAND - T_HOLD)));
      const to = targetRect(f.targetId);
      x = lerp(mid.x, to.x, k);
      y = lerp(mid.y, to.y, k);
      r = lerp(mid.r, to.r, k);
      rotY = lerp(Math.PI * 2, Math.PI * 4, k);
      rotX = Math.sin(k * Math.PI) * -0.3;
    }

    o.position.set(x - W / 2, H / 2 - y, 0);
    o.scale.setScalar(Math.max(r, 1) / R);
    o.rotation.set(rotX, rotY, 0);

    // véu de fundo: acende na expansão, apaga no pouso
    const veilK = t < T_HOLD ? clamp01(t / T_EXPAND) : 1 - clamp01((t - T_HOLD) / (T_LAND - T_HOLD));
    if (veil.current) veil.current.style.opacity = String(veilK);

    if (t >= T_LAND && !s.done) {
      s.done = true;
      flight.land();
    }
    if (t >= T_LAND + T_FADE) flight.end();
  });

  return (
    <group ref={ref}>
      <primitive object={g} />
    </group>
  );
}

/** Camada fixa em tela cheia onde a logo "voa" do hero até a seção da empresa. */
export default function FlyLayer() {
  const f = useFlight();
  const veil = useRef<HTMLDivElement>(null);
  if (!f) return null;
  return (
    <div className={`fly-layer${f.landed ? ' landed' : ''}`} aria-hidden="true">
      <div className="fly-veil" ref={veil} />
      <Canvas
        key={f.id}
        orthographic
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, toneMappingExposure: 1.05 }}
        camera={{ position: [0, 0, 4000], near: 1, far: 8000, zoom: 1 }}
        className="fly-canvas"
      >
        <Lights />
        <Flyer f={f} veil={veil} />
      </Canvas>
    </div>
  );
}

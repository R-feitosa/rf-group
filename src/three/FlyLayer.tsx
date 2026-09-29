import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Lights } from './Logo3D';
import { getLogo, LOGOS, R, type LogoKey } from './logos';
import { flight, MEDAL_FILL, useFlight, type Flight } from './flight';
import { scheduleWarm } from './warm';
import { device } from './device';

// Linha do tempo (segundos) — ritmo calmo: menos deslocamento por quadro = movimento mais fluido
const T_EXPAND = 1.0; // sai da órbita e cresce no centro da tela
const T_HOLD = 1.35; // pausa de destaque
const T_SCROLL = 1.15; // começa a rolar a página
const D_SCROLL = 1.5;
const T_LAND = 2.85; // pousa na área da empresa
const T_FADE = 0.35;

// curvas suaves (seno): aceleração e frenagem sem trancos
const ease = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.min(Math.max(t, 0), 1);
const lerp = THREE.MathUtils.lerp;

/**
 * Posição da logo de destino em coordenadas do documento, pelo layout (offsetTop/Left),
 * sem transforms: não força reflow durante a rolagem e não sofre com animações de revelação.
 */
function targetDoc(id: string) {
  const el = (document.getElementById(id)?.querySelector('.logo3d') ?? document.getElementById(id)) as HTMLElement;
  let x = 0, y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) { x += n.offsetLeft; y += n.offsetTop; }
  const w = el.offsetWidth, h = el.offsetHeight;
  return { x: x + w / 2, y: y + h / 2, r: (Math.min(w, h) / 2) * MEDAL_FILL };
}

/** Compila os shaders com uma logo invisível assim que a camada monta. */
function Prewarm({ obj }: { obj: THREE.Object3D }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    gl.debug.checkShaderErrors = import.meta.env.DEV;
    obj.visible = true;
    gl.compile(scene, camera);
    gl.render(scene, camera); // conclui a compilação e envia a geometria para a GPU
    obj.visible = false;
    gl.render(scene, camera); // limpa o canvas
  }, [gl, scene, camera, obj]);
  return <primitive object={obj} />;
}

/** Faz um render invisível de cada logo para enviar todas as geometrias à GPU antes do primeiro voo. */
function UploadAll({ logos }: { logos: Record<LogoKey, THREE.Group> }) {
  const { gl, camera } = useThree();
  useEffect(() => {
    const tmp = new THREE.Scene();
    Object.values(logos).forEach((g) => {
      tmp.add(g);
      gl.render(tmp, camera);
      tmp.remove(g);
    });
    gl.clear();
  }, [gl, camera, logos]);
  return null;
}

/**
 * O canvas do voo tem só o tamanho do medalhão (não a tela toda) e é movido/escalado por
 * transform CSS — mover uma camada é quase de graça para a GPU; pintar tela cheia a cada quadro não.
 * RC = raio (px) do medalhão desenhado dentro do canvas; SIDE = lado do canvas (folga para girar).
 */
function flyBox() {
  const midR = Math.min(innerWidth, innerHeight) * 0.3;
  const el = document.querySelector<HTMLElement>('.visual .logo3d');
  const unitR = el ? (el.offsetWidth / 2) * MEDAL_FILL : 0;
  const rc = Math.ceil(Math.max(midR * 1.05, unitR));
  return { midR, rc, side: Math.ceil(rc * 2.5) };
}
type Box = ReturnType<typeof flyBox>;

type St = { id: number; t0: number; scrollFrom: number; scrollTo: number; to: ReturnType<typeof targetDoc> | null; landed: boolean };

function Flyer({ f, logos, veil, holder, box }: {
  f: Flight | null; logos: Record<LogoKey, THREE.Group>; veil: React.RefObject<HTMLDivElement>;
  holder: React.RefObject<HTMLDivElement>; box: Box;
}) {
  const ref = useRef<THREE.Group>(null!);
  const st = useRef<St>({ id: -1, t0: 0, scrollFrom: 0, scrollTo: 0, to: null, landed: false });
  const { gl, scene, camera } = useThree();

  useFrame(() => {
    if (!f) return;
    const s = st.current;
    const now = performance.now();
    if (s.id !== f.id) Object.assign(s, { id: f.id, t0: now, to: null, landed: false });
    const t = (now - s.t0) / 1000;
    const o = ref.current;
    const W = innerWidth, H = innerHeight;
    const mid = { x: W / 2, y: H / 2, r: box.midR };

    // rolagem controlada até centralizar a logo da empresa
    if (t >= T_SCROLL) {
      if (!s.to) {
        s.to = targetDoc(f.targetId);
        const max = document.documentElement.scrollHeight - innerHeight;
        s.scrollFrom = scrollY;
        s.scrollTo = Math.min(Math.max(s.to.y - innerHeight / 2, 0), max);
        flight.travel();
      }
      const k = clamp01((t - T_SCROLL) / D_SCROLL);
      const y = Math.round(lerp(s.scrollFrom, s.scrollTo, ease(k)));
      if (y !== Math.round(scrollY)) window.scrollTo({ top: y, behavior: 'instant' });
    }

    let x: number, y: number, r: number, rotY: number, rotX: number;
    if (t < T_EXPAND) {
      const k = easeOutCubic(t / T_EXPAND); // reage na hora ao clique e freia suave
      x = lerp(f.from.x, mid.x, k);
      y = lerp(f.from.y, mid.y, k) - Math.sin(k * Math.PI) * H * 0.06; // leve arco
      r = lerp(f.from.r, mid.r, k);
      rotY = lerp(f.from.rotY, Math.PI * 2, k);
      rotX = Math.sin(k * Math.PI) * 0.35;
    } else if (t < T_HOLD || !s.to) {
      const k = clamp01((t - T_EXPAND) / (T_HOLD - T_EXPAND));
      x = mid.x; y = mid.y;
      r = mid.r * (1 + Math.sin(k * Math.PI) * 0.05);
      rotY = Math.PI * 2 + Math.sin(k * Math.PI) * 0.25;
      rotX = 0;
    } else {
      const k = ease(clamp01((t - T_HOLD) / (T_LAND - T_HOLD)));
      const to = s.to;
      x = lerp(mid.x, to.x - scrollX, k);
      y = lerp(mid.y, to.y - scrollY, k);
      r = lerp(mid.r, to.r, k);
      rotY = lerp(Math.PI * 2, Math.PI * 4, k);
      rotX = Math.sin(k * Math.PI) * -0.3;
    }

    o.visible = true;
    o.scale.setScalar(box.rc / R);
    o.rotation.set(rotX, rotY, 0);
    if (holder.current) {
      holder.current.style.transform =
        `translate3d(${(x - box.side / 2).toFixed(1)}px,${(y - box.side / 2).toFixed(1)}px,0) scale(${(Math.max(r, 1) / box.rc).toFixed(4)})`;
    }

    // véu de fundo: acende na expansão, apaga no pouso
    const veilK = t < T_HOLD ? clamp01(t / T_EXPAND) : 1 - clamp01((t - T_HOLD) / (T_LAND - T_HOLD));
    if (veil.current) veil.current.style.opacity = veilK.toFixed(3);

    if (t >= T_LAND && !s.landed) {
      s.landed = true;
      flight.land();
    }
    if (t >= T_LAND + T_FADE) {
      // limpa o canvas antes de parar o loop, senão o último quadro fica congelado na tela
      o.visible = false;
      gl.render(scene, camera);
      flight.end();
    }
  });

  return (
    <group ref={ref} visible={false}>
      {f && <primitive object={logos[f.logo]} />}
    </group>
  );
}

/**
 * Camada fixa em tela cheia onde a logo "voa" do hero até a seção da empresa.
 * Fica montada desde o carregamento (contexto WebGL, geometrias e shaders prontos)
 * e só renderiza durante o voo.
 */
export default function FlyLayer() {
  const f = useFlight();
  const veil = useRef<HTMLDivElement>(null);
  const [warm, setWarm] = useState(false);
  // aparelho fraco não usa o voo: nem monta a camada
  useEffect(() => scheduleWarm(() => { if (!device.lowEnd) setWarm(true); }), []);
  // marca o <body> durante o voo para pausar animações CSS de fundo
  useEffect(() => { document.body.classList.toggle('flying', !!f); }, [f]);
  // clique antes do pré-aquecimento terminar: monta na hora
  useEffect(() => { if (f && !warm) setWarm(true); }, [f, warm]);
  const logos = useMemo(
    () => (warm ? (Object.fromEntries(LOGOS.map((k) => [k, getLogo(k)])) as Record<LogoKey, THREE.Group>) : null),
    [warm],
  );
  const probe = useMemo(() => (warm ? getLogo('rf-group') : null), [warm]);
  const holder = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  useEffect(() => {
    if (!warm) return;
    const on = () => setBox(flyBox());
    on();
    addEventListener('resize', on);
    return () => removeEventListener('resize', on);
  }, [warm]);
  if (!logos || !probe || !box) return null;
  return (
    <div className={`fly-layer${f ? ' on' : ''}${f?.landed ? ' landed' : ''}`} aria-hidden="true">
      <div className="fly-veil" ref={veil} />
      <div className="fly-medal" ref={holder} style={{ width: box.side, height: box.side }}>
      <Canvas
        orthographic
        frameloop={f ? 'always' : 'never'}
        dpr={[1, 1.5]}
        resize={{ scroll: false }}
        gl={{ antialias: true, alpha: true, toneMappingExposure: 1.05, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 4000], near: 1, far: 8000, zoom: 1 }}
        className="fly-canvas"
      >
        <Lights />
        <Prewarm obj={probe} />
        <UploadAll logos={logos} />
        <Flyer f={f} logos={logos} veil={veil} holder={holder} box={box} />
      </Canvas>
      </div>
    </div>
  );
}

import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { FitCamera, Lights, Precompile, useInView, useLogo } from './Logo3D';
import { R, type LogoKey } from './logos';
import { pointer, scroll, prefersReducedMotion } from './motion';
import { flight, useFlight } from './flight';

const SATELLITES: { key: LogoKey; target: string; name: string }[] = [
  { key: 'feitosa-advogados', target: 'feitosa-advogados', name: 'R.Feitosa Advogados' },
  { key: 'connect-valley', target: 'connect-valley', name: 'Connect Valley' },
  { key: 'connect-academy', target: 'connect-academy', name: 'Connect Academy' },
  { key: 'eco-solucoes', target: 'eco-solucoes', name: 'Eco Soluções' },
  { key: 'feitosa-imobiliarias', target: 'feitosa-imoveis', name: 'Feitosa Imóveis' },
];

const ORBIT = R * 1.85;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

function Satellite({ logo, index, total, target, onHover }: {
  logo: LogoKey; index: number; total: number; target: string; onHover: (n: string | null) => void;
}) {
  const g = useLogo(logo);
  const ref = useRef<THREE.Group>(null!);
  const hover = useRef(false);
  const phase = (index / total) * Math.PI * 2;
  const gl = useThree((st) => st.gl);

  // clique: mede o medalhão na tela e dispara o voo até a seção da empresa
  const launch = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const el = document.getElementById(target);
    if (prefersReducedMotion() || !el) return el?.scrollIntoView({ block: 'center' });
    el.querySelector('.visual')?.classList.add('in'); // revela a área de destino já no clique
    const o = ref.current;
    const cam = e.camera as THREE.PerspectiveCamera;
    const box = gl.domElement.getBoundingClientRect();
    const wp = o.getWorldPosition(new THREE.Vector3());
    const ndc = wp.clone().project(cam);
    const halfH = cam.position.distanceTo(wp) * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    flight.start({
      logo,
      targetId: target,
      from: {
        x: box.left + ((ndc.x + 1) / 2) * box.width,
        y: box.top + ((1 - ndc.y) / 2) * box.height,
        r: ((o.getWorldScale(new THREE.Vector3()).x * R) / halfH) * (box.height / 2),
        rotY: o.rotation.y % (Math.PI * 2),
      },
    });
    hover.current = false;
    document.body.style.cursor = '';
    onHover(null);
  };

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const k = easeOut(Math.min(Math.max((t - 0.6 - index * 0.12) / 1.4, 0), 1));
    const a = phase + t * 0.22;
    const r = ORBIT * (0.4 + 0.6 * k);
    const o = ref.current;
    // órbita elíptica levemente inclinada: passa por trás e pela frente do medalhão central
    o.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.42, Math.sin(a) * r * 0.6);
    // balança mostrando a face e dá um giro completo a cada ~9 s (defasado por satélite)
    const cycle = (t * 0.11 + index / total) % 1;
    const flip = cycle > 0.88 ? easeOut((cycle - 0.88) / 0.12) * Math.PI * 2 : 0;
    o.rotation.y = Math.sin(t * 0.9 + index) * 0.5 + flip;
    o.rotation.x = Math.sin(t * 0.8 + index) * 0.2;
    // some da órbita enquanto voa (a cópia na camada de voo assume) e volta depois
    const flying = flight.get()?.logo === logo;
    const sc = flying ? 0 : 0.3 * k * (hover.current ? 1.3 : 1);
    o.scale.setScalar(flying ? 0.001 : Math.max(o.scale.x + (sc - o.scale.x) * 0.15, 0.001));
  });

  return (
    <group
      ref={ref}
      onPointerOver={(e) => { e.stopPropagation(); hover.current = true; document.body.style.cursor = 'pointer'; onHover(target); }}
      onPointerOut={() => { hover.current = false; document.body.style.cursor = ''; onHover(null); }}
      onClick={launch}
    >
      <primitive object={g} />
    </group>
  );
}

function Core() {
  const g = useLogo('rf-group');
  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const k = Math.min(Math.max((t - 0.2) / 1.8, 0), 1);
    const o = ref.current;
    const mx = THREE.MathUtils.clamp((pointer.x / innerWidth) * 2 - 1, -1, 1);
    const my = THREE.MathUtils.clamp((pointer.y / innerHeight) * 2 - 1, -1, 1);
    const ty = Math.sin(t * 0.9) * 0.45 + mx * 0.35 + Math.pow(1 - k, 3) * -Math.PI * 4;
    o.rotation.y = k < 1 ? ty : o.rotation.y + (ty - o.rotation.y) * 0.08;
    o.rotation.x += (my * 0.25 + THREE.MathUtils.clamp(scroll.velocity * 0.004, -0.3, 0.3) - o.rotation.x) * 0.08;
    o.position.y = Math.sin(t * 1.2) * R * 0.05;
    o.scale.setScalar(Math.max(easeOut(k), 0.001));
  });
  return (
    <group ref={ref}>
      <primitive object={g} />
    </group>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame(() => {
    // todo o sistema sobe e inclina conforme o usuário rola a página
    const p = Math.min(scroll.y / innerHeight, 1.2);
    ref.current.rotation.x = -0.12 + p * 0.5;
    ref.current.rotation.z = p * 0.25;
  });
  return <group ref={ref}>{children}</group>;
}

function StaticScene() {
  const g = useLogo('rf-group');
  return <primitive object={g} />;
}

export default function HeroScene() {
  const { ref, inView, seen } = useInView<HTMLDivElement>();
  const [hover, setHover] = useState<string | null>(null);
  const reduce = prefersReducedMotion();
  const label = SATELLITES.find((s) => s.target === hover)?.name;
  const f = useFlight();
  const paused = f?.phase === 'travel'; // coberto pelo véu enquanto a página rola

  return (
    <div ref={ref} className="hero-canvas" role="img" aria-label="Logo 3D do RFEITOSA Group com as empresas do grupo em órbita">
      {seen && (
        <Canvas
          frameloop={reduce ? 'demand' : inView && !paused ? 'always' : 'never'}
          dpr={[1, 1.75]}
          resize={{ scroll: false }}
          gl={{ antialias: true, alpha: true, toneMappingExposure: 1.05 }}
          camera={{ fov: 30, near: 0.01, far: 10, position: [0, 0, 0.42] }}
        >
          <FitCamera distance={0.42} />
          <Lights />
          <Precompile />
          {reduce ? (
            <StaticScene />
          ) : (
            <Rig>
              <Core />
              {SATELLITES.map((s, i) => (
                <Satellite key={s.key} logo={s.key} index={i} total={SATELLITES.length} target={s.target} onHover={setHover} />
              ))}
            </Rig>
          )}
        </Canvas>
      )}
      <div className={`orbit-tip${label ? ' on' : ''}`} aria-hidden="true">{label ?? ''}</div>
    </div>
  );
}

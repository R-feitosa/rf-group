import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { buildLogo, disposeGroup, R, type LogoKey } from './logos';
import { pointer, scroll, prefersReducedMotion } from './motion';
import { flight, useFlight } from './flight';

export type Motion = 'sway' | 'spin' | 'float' | 'none';

const easeOutBack = (t: number) => {
  const c = 1.4;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

function Lights() {
  return (
    <>
      <hemisphereLight args={[0xffffff, 0x8a8580, 1.6]} />
      <directionalLight position={[0.6, 0.9, 1.2]} intensity={2.4} />
      <directionalLight position={[-1, 0.3, -0.6]} intensity={1.0} />
    </>
  );
}

/** Ajusta a câmera para o medalhão caber no canvas em qualquer proporção. */
function FitCamera({ distance }: { distance: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    camera.position.set(0, 0, distance * Math.max(1, 1 / aspect));
    camera.updateProjectionMatrix();
  }, [camera, size, distance]);
  return null;
}

export function useLogo(key: LogoKey) {
  const group = useMemo(() => buildLogo(key), [key]);
  useEffect(() => () => disposeGroup(group), [group]);
  return group;
}

type MedalProps = {
  logo: LogoKey;
  motion: Motion;
  hostRef: React.RefObject<HTMLElement>;
  hovered: React.MutableRefObject<boolean>;
  entered: boolean;
};

/**
 * Medalhão animado:
 *  - entrada: gira 1,5 volta e cresce com "overshoot" ao entrar na tela;
 *  - idle: sway / spin / float + leve flutuação vertical;
 *  - segue o mouse, inclina com a velocidade do scroll;
 *  - hover: dá um giro completo (flip) e cresce um pouco.
 */
function Medal({ logo, motion, hostRef, hovered, entered }: MedalProps) {
  const group = useLogo(logo);
  const pivot = useRef<THREE.Group>(null!);
  const st = useRef({ t0: -1, flip: 0, flipTarget: 0, wasHover: false, seed: Math.random() * 10 });
  const reduce = prefersReducedMotion();

  useFrame(({ clock }) => {
    const p = pivot.current;
    const s = st.current;
    const t = clock.elapsedTime;
    if (reduce || motion === 'none') {
      p.rotation.set(0, 0, 0);
      p.scale.setScalar(1);
      return;
    }
    if (!entered) {
      p.scale.setScalar(0.001);
      return;
    }
    // se a logo chegou voando do hero, pula a animação de entrada
    if (s.t0 < 0) s.t0 = flight.get()?.logo === logo ? t - 10 : t;
    const k = Math.min((t - s.t0) / 1.6, 1);
    const intro = easeOutBack(k);
    const introSpin = Math.pow(1 - k, 3) * -Math.PI * 3;

    // pointer relativo ao elemento (-1..1)
    const b = hostRef.current?.getBoundingClientRect();
    let mx = 0, my = 0;
    if (b) {
      mx = THREE.MathUtils.clamp(((pointer.x - b.left - b.width / 2) / innerWidth) * 2, -1, 1);
      my = THREE.MathUtils.clamp(((pointer.y - b.top - b.height / 2) / innerHeight) * 2, -1, 1);
    }

    if (hovered.current && !s.wasHover) s.flipTarget += Math.PI * 2;
    s.wasHover = hovered.current;
    s.flip += (s.flipTarget - s.flip) * 0.06;

    const tt = t + s.seed;
    const base =
      motion === 'spin' ? tt * 0.8 :
      motion === 'sway' ? Math.sin(tt * 0.9) * 0.45 :
      Math.sin(tt * 0.6) * 0.25;
    const targetY = base + mx * 0.35 + introSpin + s.flip;
    const targetX = my * 0.25 + THREE.MathUtils.clamp(scroll.velocity * 0.004, -0.35, 0.35) + Math.sin(tt * 0.7) * 0.06;

    p.rotation.y = motion === 'spin' || k < 1 ? targetY : p.rotation.y + (targetY - p.rotation.y) * 0.08;
    p.rotation.x += (targetX - p.rotation.x) * 0.08;
    p.rotation.z = Math.sin(tt * 0.5) * 0.03;
    p.position.y = Math.sin(tt * 1.3) * R * 0.04;
    const hoverScale = hovered.current ? 1.06 : 1;
    const sc = p.scale.x + (intro * hoverScale - p.scale.x) * (k < 1 ? 1 : 0.1);
    p.scale.setScalar(Math.max(sc, 0.001));
  });

  return (
    <group ref={pivot}>
      <primitive object={group} />
    </group>
  );
}

/** Pausa o render quando o canvas sai da tela. */
export function useInView<T extends Element>(opts: IntersectionObserverInit = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
      if (e.isIntersecting) setSeen(true);
    }, opts);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ref, inView, seen };
}

type Logo3DProps = {
  logo: LogoKey;
  motion?: Motion;
  className?: string;
  style?: CSSProperties;
  label?: string;
};

export default function Logo3D({ logo, motion = 'sway', className, style, label }: Logo3DProps) {
  const { ref, inView, seen } = useInView<HTMLDivElement>({ rootMargin: '80px' });
  const hovered = useRef(false);
  const f = useFlight();
  const waiting = f?.logo === logo && !f.landed; // escondida até a cópia voadora pousar
  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, opacity: waiting ? 0 : 1, transition: 'opacity .3s' }}
      role="img"
      aria-label={label ?? `Logo 3D ${logo}`}
      onPointerEnter={(e) => {
        // só mouse de verdade; ignora o "hover" gerado pela rolagem automática do voo
        if (e.pointerType === 'mouse' && !flight.get()) hovered.current = true;
      }}
      onPointerLeave={() => (hovered.current = false)}
    >
      {seen && (
        <Canvas
          frameloop={inView ? 'always' : 'never'}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, toneMappingExposure: 1.05 }}
          camera={{ fov: 30, near: 0.01, far: 10, position: [0, 0, 0.22] }}
          style={{ width: '100%', height: '100%' }}
        >
          <FitCamera distance={0.22} />
          <Lights />
          <Medal logo={logo} motion={motion} hostRef={ref} hovered={hovered} entered={seen} />
        </Canvas>
      )}
    </div>
  );
}

export { Lights, FitCamera };

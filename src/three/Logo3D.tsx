import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useThree } from '@react-three/fiber';
import { getLogo, type LogoKey } from './logos';
import { flight, useFlight } from './flight';
import { scheduleWarm } from './warm';
import { kick, register, unregister, type LogoItem, type Motion } from './sharedLogos';
import { useLanding } from '../landing/store';

export type { Motion };

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
  return useMemo(() => getLogo(key), [key]);
}

/**
 * Prepara o canvas assim que ele monta (fora da tela): compila os shaders e faz um render real,
 * que envia as geometrias para a GPU e conclui a compilação. Sem isso, o primeiro quadro visível
 * trava (o driver só termina de compilar quando o programa é usado).
 */
export function Precompile() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    gl.debug.checkShaderErrors = import.meta.env.DEV; // em produção evita leituras síncronas de log
    gl.compile(scene, camera);
    gl.render(scene, camera);
  }, [gl, scene, camera]);
  return null;
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
  /** false = logo registrada mas parada (ex.: logo da landing enquanto ela está fechada) */
  active?: boolean;
  /** ignora o IntersectionObserver: visível sempre que `active` (logo dentro de camada fixa, ex.: landing) */
  ignoreViewport?: boolean;
  /** clique/Enter na logo (ex.: abrir a landing da marca) */
  onActivate?: (el: HTMLElement) => void;
  motion?: Motion;
  className?: string;
  style?: CSSProperties;
  label?: string;
};

/**
 * Logo 3D animada de uma seção. Não cria contexto WebGL próprio: é desenhada pelo renderizador
 * compartilhado (sharedLogos.ts) num <canvas> 2D — o celular tem limite de contextos WebGL.
 */
export default function Logo3D({ logo, motion = 'sway', className, style, label, onActivate, active = true, ignoreViewport = false }: Logo3DProps) {
  const io = useInView<HTMLDivElement>({ rootMargin: '80px' });
  const { ref } = io;
  const inView = io.inView || (ignoreViewport && active);
  const seen = io.seen || (ignoreViewport && active);
  const canvas = useRef<HTMLCanvasElement>(null);
  const item = useRef<LogoItem | null>(null);
  const f = useFlight();
  const waiting = f?.logo === logo && !f.landed; // escondida até a cópia voadora pousar
  const paused = !!f && f.logo !== logo; // durante o voo só a logo de destino anima
  const land = useLanding();
  const exploded = !!onActivate && land?.key === logo; // some enquanto a versão fragmentada está na tela
  const [warm, setWarm] = useState(false);
  useEffect(() => scheduleWarm(() => setWarm(true)), []);
  const ready = warm || (seen && active);

  // registra no renderizador compartilhado (em momento ocioso, via fila de pré-aquecimento)
  useEffect(() => {
    if (!ready || !ref.current || !canvas.current) return;
    const it = register({ logo, motion, host: ref.current, canvas: canvas.current, track: !!onActivate });
    item.current = it;
    return () => { unregister(it); item.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, logo, motion]);

  // liga/desliga a animação conforme visibilidade, voo e landing
  const running = ready && active && inView && !paused && !(land && land.key !== logo);
  useEffect(() => {
    const it = item.current;
    if (!it) return;
    it.entered = it.entered || seen;
    it.running = running;
    if (running) kick();
  }, [running, seen, ready]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, opacity: waiting || exploded ? 0 : 1, transition: exploded ? 'none' : 'opacity .3s' }}
      role={onActivate ? 'button' : 'img'}
      tabIndex={onActivate ? 0 : undefined}
      aria-label={label ?? `Logo 3D ${logo}`}
      onClick={onActivate ? (e) => onActivate(e.currentTarget) : undefined}
      onKeyDown={onActivate ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(e.currentTarget); } } : undefined}
      onPointerEnter={(e) => {
        // só mouse de verdade; ignora o "hover" gerado pela rolagem automática do voo
        if (e.pointerType === 'mouse' && !flight.get() && item.current) item.current.hovered = true;
      }}
      onPointerLeave={() => { if (item.current) item.current.hovered = false; }}
    >
      <canvas ref={canvas} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}

export { Lights, FitCamera };

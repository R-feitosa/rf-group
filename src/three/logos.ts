// Modelos 3D das logos RF Group (linha "Simplificação"), vetorizados do manual de marca.
// buildLogo(key) → THREE.Group: medalhão de 10 cm, face para +z, centrado na origem.
import * as THREE from 'three';
import DATA from './logos.json';

export const LOGOS = [
  'rf-group',
  'feitosa-imobiliarias',
  'feitosa-advogados',
  'eco-solucoes',
  'connect-valley',
  'connect-academy',
] as const;
export type LogoKey = (typeof LOGOS)[number];

type Pt = [number, number];
type LogoData = {
  disc: string;
  ring?: [number, number];
  layers: [string, string, { o: Pt[]; h: Pt[][] }[]][];
};

export const R = 0.05;
const T = 0.012;
const RB = 0.004;

function medallion(color: string, mat: (n: string, c: string, r?: number) => THREE.Material) {
  const pts = [new THREE.Vector2(0, -T / 2), new THREE.Vector2(R - RB, -T / 2)];
  for (let i = 1; i <= 8; i++) {
    const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R - RB + Math.cos(a) * RB, -T / 2 + RB + Math.sin(a) * RB));
  }
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    pts.push(new THREE.Vector2(R - RB + Math.cos(a) * RB, T / 2 - RB + Math.sin(a) * RB));
  }
  pts.push(new THREE.Vector2(0, T / 2));
  const geo = new THREE.LatheGeometry(pts, 128);
  geo.rotateX(Math.PI / 2);
  const puck = new THREE.Mesh(geo, mat('fundo', color, 0.5));
  puck.name = 'medalhao';
  return puck;
}

// Connect Academy não tem vetor no manual: medalhão navy com monograma "CA" gravado em textura.
function academyFace() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const x = c.getContext('2d')!;
  const draw = () => {
    x.clearRect(0, 0, 1024, 1024);
    x.fillStyle = '#ffffff';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.font = '600 400px "Cormorant Garamond", Georgia, serif';
    x.fillText('CA', 512, 470);
    x.font = '500 58px Inter, system-ui, sans-serif';
    x.letterSpacing = '26px';
    x.fillText('ACADEMY', 525, 720);
    x.strokeStyle = 'rgba(255,255,255,.5)';
    x.lineWidth = 6;
    x.beginPath();
    x.arc(512, 512, 470, 0, Math.PI * 2);
    x.stroke();
  };
  draw();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  // redesenha quando as webfonts terminarem de carregar
  document.fonts?.ready.then(() => { draw(); tex.needsUpdate = true; });
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(R * 0.92, 96),
    new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.35, metalness: 0.1 }),
  );
  m.position.z = T / 2 + 0.0003;
  m.name = 'monograma';
  return m;
}

export function buildLogo(key: LogoKey): THREE.Group {
  const mats: Record<string, THREE.Material> = {};
  const mat = (name: string, color: string, rough = 0.42) =>
    (mats[name] ??= Object.assign(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.05 }), { name }));
  const g = new THREE.Group();
  g.name = key;

  if (key === 'connect-academy') {
    g.add(medallion('#212965', mat), academyFace());
    return g;
  }

  const D = (DATA as unknown as Record<string, LogoData>)[key];
  g.add(medallion(D.disc, mat));

  const BT = 0.0004, BS = 0.00012;
  const relief = (shapes: THREE.Shape | THREE.Shape[], m: THREE.Material, name: string, depth: number) => {
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth, bevelEnabled: true, bevelThickness: BT, bevelSize: BS, bevelSegments: 2, curveSegments: 48,
    });
    const mesh = new THREE.Mesh(geo, m);
    mesh.name = name;
    mesh.position.z = T / 2 + BT - 0.0002;
    g.add(mesh);
  };
  const v = ([x, y]: Pt) => new THREE.Vector2(x * R, y * R);

  if (D.ring) {
    const s = new THREE.Shape();
    s.absarc(0, 0, R * Math.min(D.ring[1], 0.97), 0, Math.PI * 2);
    const h = new THREE.Path();
    h.absarc(0, 0, R * D.ring[0], 0, Math.PI * 2, true);
    s.holes.push(h);
    relief(s, mat('preto', '#151515', 0.4), 'aro', 0.001);
  }
  for (const [name, color, list] of D.layers) {
    const shapes = list.map(({ o, h }) => {
      const s = new THREE.Shape(o.map(v));
      h.forEach((p) => s.holes.push(new THREE.Path(p.map(v))));
      return s;
    });
    const white = color === '#ffffff';
    relief(shapes, mat(white ? 'branco' : name, white ? '#f4f4f2' : color, 0.35), name, 0.0022);
  }
  return g;
}

export function disposeGroup(g: THREE.Object3D) {
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.geometry.dispose();
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    mats.forEach((mt) => {
      (mt as THREE.MeshStandardMaterial).map?.dispose();
      mt.dispose();
    });
  });
}

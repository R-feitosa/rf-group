/**
 * Classifica o aparelho como "fraco" para desligar efeitos pesados (voo da logo).
 * Critérios, em ordem:
 *  1. override pela URL: ?fx=lite força modo leve, ?fx=full força efeitos completos;
 *  2. economia de dados ligada, ou pouca memória/poucos núcleos (navigator.deviceMemory ≤ 2,
 *     ou ≤ 4 núcleos com ≤ 4 GB);
 *  3. GPU emulada por software (SwiftShader, llvmpipe etc.);
 *  4. medição real: mediana de ~90 quadros do hero > 34 ms (< ~30 fps), ignorando travadas
 *     pontuais (> 250 ms) típicas da abertura — evita marcar desktop bom como fraco.
 */
type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

const fx = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('fx') : null;
const forced = fx === 'lite' ? true : fx === 'full' ? false : null;

function staticGuess() {
  if (typeof navigator === 'undefined') return false;
  const n = navigator as Nav;
  const mem = n.deviceMemory ?? 8;
  const cores = n.hardwareConcurrency ?? 8;
  return !!n.connection?.saveData || mem <= 2 || (cores <= 4 && mem <= 4);
}

export const device = {
  lowEnd: forced ?? staticGuess(),
  measured: forced !== null,
};

const SOFTWARE_GPU = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/** Chamado quando o primeiro contexto WebGL é criado. */
export function checkRenderer(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  if (forced !== null) return;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const name = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  if (SOFTWARE_GPU.test(name)) device.lowEnd = true;
}

const samples: number[] = [];
/** Recebe os tempos de quadro do hero (s) durante a abertura; decide uma vez com ~90 amostras. */
export function sampleFrame(dt: number) {
  if (device.measured) return;
  if (dt > 0.25) return; // travada pontual (carregamento), não representa o desempenho do aparelho
  samples.push(dt);
  if (samples.length < 90) return;
  device.measured = true;
  const s = [...samples].sort((a, b) => a - b);
  if (s[Math.floor(s.length / 2)] > 0.034) device.lowEnd = true;
}

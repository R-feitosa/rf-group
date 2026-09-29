/**
 * Fila que monta os canvases 3D um por vez em momentos ociosos (após o carregamento),
 * para que criar contexto WebGL / compilar shaders nunca aconteça durante rolagem ou clique.
 */
const queue: (() => void)[] = [];
let started = false;
let busy = false;

const idle = (fn: () => void) =>
  'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1000 }) : setTimeout(fn, 120);

function pump() {
  if (!started || busy) return;
  const job = queue.shift();
  if (!job) return;
  busy = true;
  idle(() => {
    job();
    // dá um respiro entre montagens
    setTimeout(() => { busy = false; pump(); }, 150);
  });
}

export function scheduleWarm(job: () => void) {
  queue.push(job);
  pump();
  return () => {
    const i = queue.indexOf(job);
    if (i >= 0) queue.splice(i, 1);
  };
}

export function startWarm() {
  started = true;
  pump();
}

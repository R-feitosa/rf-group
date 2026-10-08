/**
 * Fila que monta os canvases 3D um por vez em momentos ociosos (após o carregamento),
 * para que criar contexto WebGL / compilar shaders nunca aconteça durante rolagem ou clique.
 */
const queue: (() => void)[] = [];
let started = false;
let busy = false;
let paused = 0; // > 0: há animação pesada (explosão) tocando; a fila espera

const idle = (fn: () => void) =>
  'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1000 }) : setTimeout(fn, 120);

function pump() {
  if (!started || busy || paused) return;
  const job = queue.shift();
  if (!job) return;
  busy = true;
  idle(() => {
    if (paused) { queue.unshift(job); busy = false; return; } // pausou enquanto esperava: devolve à fila
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

/** Pausa a fila durante uma animação; devolve a função que retoma. */
export function pauseWarm() {
  paused++;
  let done = false;
  return () => { if (done) return; done = true; paused--; pump(); };
}

export function startWarm() {
  started = true;
  pump();
}

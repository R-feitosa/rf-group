// Símbolo da Eco Soluções (o mesmo vetor da moeda 3D, src/three/logos.json → eco-solucoes/simbolo), em SVG.
const D = 'M-26.6 -44.3L-27.5 -43.5L-28.0 -38.7L-27.3 -37.1L-26.3 -36.7L33.3 -36.7L34.3 -36.3L34.7 -35.3L34.7 -14.0L34.2 -13.1L-25.7 -13.0L-27.4 -12.4L-28.0 -9.7L-28.0 8.3L-27.5 9.9L-26.5 10.9L33.3 11.0L34.3 11.3L34.7 12.0L34.7 33.0L34.3 33.9L33.3 34.3L-26.0 34.3L-27.3 35.0L-28.0 37.0L-28.0 40.0L-27.3 41.6L-26.3 42.0L-20.7 42.0L41.1 42.1L42.1 41.7L42.7 40.3L42.7 5.0L41.7 3.0L40.7 2.7L-12.3 2.7L-18.0 3.0L-19.9 1.9L-20.0 -3.3L-19.4 -4.7L-18.7 -5.0L41.8 -5.2L42.7 -6.7L42.7 -42.0L42.2 -43.9L41.3 -44.3ZM-40.9 -28.6L-43.1 -28.1L-43.7 -26.7L-43.7 25.0L-43.3 25.9L-41.0 26.7L24.7 26.7L26.9 25.9L26.9 19.5L25.3 18.7L-25.3 18.7L-34.3 18.7L-35.5 17.9L-36.0 16.0L-36.0 -19.0L-35.6 -19.9L-34.0 -20.7L25.7 -20.7L26.6 -21.1L27.0 -22.0L26.8 -27.8L24.7 -28.7Z';

export function EcoSymbol({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-45 -46 90 90" aria-hidden="true" focusable="false">
      <path d={D} fillRule="evenodd" fill="currentColor" />
    </svg>
  );
}

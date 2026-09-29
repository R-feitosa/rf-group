import { MARQUEE } from '../data';

export default function Marquee() {
  const row = [...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="track">{row.map((w, i) => <span key={i}>{w}</span>)}</div>
    </div>
  );
}

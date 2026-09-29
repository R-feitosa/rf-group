import type { CSSProperties } from 'react';
import { NUMBERS } from '../data';
import Counter from './Counter';
import Reveal, { Eyebrow } from './Reveal';

export default function Numbers() {
  return (
    <section className="numbers" id="numeros">
      <div className="wrap">
        <Eyebrow>O grupo em números</Eyebrow>
        <Reveal as="h2" style={{ maxWidth: 640 }}>Resultados que <strong>sustentam a confiança.</strong></Reveal>
        <div className="row">
          {NUMBERS.map((n, i) => (
            <Reveal className="cell" key={n.label} style={{ '--d': `${i * 0.1}s` } as CSSProperties}>
              <Counter {...n} /><span>{n.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

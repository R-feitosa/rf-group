import { PILLARS } from '../data';
import Reveal, { Eyebrow } from './Reveal';

export default function About() {
  return (
    <section className="about" id="quem-somos">
      <div className="wrap grid">
        <Reveal variant="left">
          <Eyebrow>Quem somos</Eyebrow>
          <h2>Um ecossistema que reúne <strong>inovação, solidez e visão estratégica.</strong></h2>
          <p>
            O <strong>RFEITOSA Group</strong> integra soluções nas áreas de <strong>imóveis</strong>, <strong>soluções empresariais</strong>,{' '}
            <strong>assessoria jurídica</strong> e <strong>eventos de negócios</strong>, atuando de forma conectada para acompanhar o
            empresário em cada etapa do seu crescimento.
          </p>
        </Reveal>
        <Reveal variant="right" className="pillars">
          {PILLARS.map((p, i) => (
            <div className="pillar" key={p.title}>
              <span className="n">{String(i + 1).padStart(2, '0')}</span><b>{p.title}</b><span>{p.text}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

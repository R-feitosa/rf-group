import { CLIENTS } from '../data';
import Reveal, { Eyebrow } from './Reveal';

// logos recortadas/otimizadas em src/assets/clients/<id>.webp
const LOGOS = import.meta.glob<string>('../assets/clients/*.webp', { eager: true, import: 'default' });
const src = (id: string) => LOGOS[`../assets/clients/${id}.webp`];

function Row({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="clients-row" aria-hidden={hidden || undefined}>
      {CLIENTS.map((c) => (
        <li key={c.id} className="client" title={c.name}>
          <img src={src(c.id)} alt={hidden ? '' : c.name} decoding="async" />
        </li>
      ))}
    </ul>
  );
}

export default function Clients() {
  return (
    <section className="clients" id="clientes" aria-labelledby="clientes-titulo">
      <div className="wrap">
        <Reveal className="head">
          <Eyebrow>Clientes</Eyebrow>
          <h2 id="clientes-titulo">Empresas que <strong>confiam no grupo.</strong></h2>
        </Reveal>
      </div>
      <div className="clients-marquee">
        {/* duas cópias da lista para o loop contínuo; a segunda é só visual */}
        <div className="clients-track">
          <Row />
          <Row hidden />
        </div>
      </div>
    </section>
  );
}

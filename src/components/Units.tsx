import type { CSSProperties } from 'react';
import { UNITS, type Unit } from '../data';
import Logo3D from '../three/Logo3D';
import Counter from './Counter';
import { Arrow, Instagram } from './Icons';
import Reveal, { Eyebrow } from './Reveal';

function UnitRow({ u, i }: { u: Unit; i: number }) {
  const even = i % 2 === 1;
  return (
    <article className="unit" id={u.id}>
      <Reveal className="visual" style={{ '--c': u.color } as CSSProperties}>
        <div className="halo" />
        <div className="shadow" />
        <Logo3D logo={u.logo} motion={u.motion} className="logo3d" label={`Logo 3D ${u.name}`} />
        <span className="drag-hint">passe o mouse</span>
      </Reveal>
      <Reveal variant={even ? 'left' : 'right'}>
        <span className="idx">{String(i + 1).padStart(2, '0')} / {String(UNITS.length).padStart(2, '0')}</span>
        <h3>{u.name}<strong>{u.tagline}</strong></h3>
        <div className="role">{u.role}</div>
        <p>{u.text}</p>
        <div className="stats">
          {u.stats.map((s) => (
            <div className="stat" key={s.label}><Counter {...s} /><span>{s.label}</span></div>
          ))}
        </div>
        <div className="links">
          <a className="btn dark" href={u.cta.href} target="_blank" rel="noopener noreferrer"><span>{u.cta.label}</span><Arrow /></a>
          <a className="ig" href={u.instagram} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${u.name}`}><Instagram /></a>
        </div>
      </Reveal>
    </article>
  );
}

export default function Units() {
  return (
    <section className="units" id="empresas">
      <div className="wrap">
        <Reveal className="head">
          <Eyebrow>Nossas empresas</Eyebrow>
          <h2>Cinco frentes, <strong>um só propósito.</strong></h2>
        </Reveal>
        {UNITS.map((u, i) => <UnitRow key={u.id} u={u} i={i} />)}
      </div>
    </section>
  );
}

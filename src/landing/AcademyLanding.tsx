import { useEffect, useRef, type CSSProperties } from 'react';
import { useLanding } from './store';
import { closeLanding } from './controller';
import { ACADEMY } from './academy';
import { UNITS, WHATSAPP } from '../data';
import Logo3D from '../three/Logo3D';
import Counter from '../components/Counter';
import { Arrow, Instagram, WhatsApp } from '../components/Icons';

const unit = UNITS.find((u) => u.id === 'connect-academy')!;

/** Landing da Connect Academy: mesma URL, escondida; aparece em círculo a partir da logo clicada. */
export default function AcademyLanding() {
  const s = useLanding();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const active = s?.key === 'connect-academy';
  const on = active && s.phase === 'open';

  // trava a rolagem da página por trás e fecha com Esc
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLanding(); };
    addEventListener('keydown', onKey);
    return () => { html.style.overflow = ''; removeEventListener('keydown', onKey); };
  }, [active]);
  useEffect(() => { if (on) closeBtn.current?.focus({ preventScroll: true }); }, [on]);
  // fica montada desde o carregamento (invisível): a logo 3D grande é preparada em segundo plano
  // e só anima com a landing aberta — nada pesado acontece no clique
  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(ACADEMY.whatsappText)}`;
  return (
    <div
      className={`land land-academy${active ? ' active' : ''}${on ? ' on' : ''}`}
      style={s ? ({ '--x': `${s.x}px`, '--y': `${s.y}px` } as CSSProperties) : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Connect Academy"
      aria-hidden={!active}
      {...(!active ? { inert: '' } : {})}
    >
      <div className="land-wrap land-nav">
        <button ref={closeBtn} className="land-back" onClick={() => closeLanding()}>
          <span aria-hidden="true">←</span> Voltar ao RF Group
        </button>
        <span className="land-brand">Connect Academy</span>
        <a className="land-btn ghost" href={wa} target="_blank" rel="noopener noreferrer">Falar com a equipe</a>
      </div>

      <section className="land-wrap land-hero">
        <div className="land-txt">
          <span className="land-k"><i />{ACADEMY.kicker}</span>
          <h1>{ACADEMY.titleLight} <strong>{ACADEMY.titleBold}</strong></h1>
          <p className="land-lead">{ACADEMY.lead}</p>
          <div className="land-cta">
            <a className="land-btn solid" href={wa} target="_blank" rel="noopener noreferrer"><WhatsApp /><span>Quero participar</span></a>
            <a className="land-btn" href={unit.cta.href} target="_blank" rel="noopener noreferrer"><span>Visitar site</span><Arrow /></a>
          </div>
        </div>
        <div className="land-big">
          <div className="land-halo" />
          <Logo3D logo="connect-academy" motion="sway" className="land-logo" label="Logo 3D Connect Academy" active={on} ignoreViewport />
        </div>
      </section>

      <section className="land-wrap land-stats" aria-label="Números">
        {unit.stats.map((st) => (
          <div key={st.label}>{on ? <Counter {...st} /> : <b>0</b>}<span>{st.label}</span></div>
        ))}
        <div><b>3</b><span>formatos de formação</span></div>
      </section>

      <section className="land-wrap land-sec">
        <h2>Formatos para cada <strong>momento do negócio.</strong></h2>
        <div className="land-grid">
          {ACADEMY.formats.map((f, i) => (
            <article key={f.t} className="land-card" style={{ '--i': i } as CSSProperties}>
              <span className="land-n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="land-wrap land-sec">
        <h2>Como <strong>funciona.</strong></h2>
        <ol className="land-steps">
          {ACADEMY.steps.map((st, i) => (
            <li key={st.t}><span>{i + 1}</span><div><h3>{st.t}</h3><p>{st.d}</p></div></li>
          ))}
        </ol>
      </section>

      <section className="land-wrap land-final">
        <h2>Pronto para <strong>provocar o próximo passo?</strong></h2>
        <div className="land-cta">
          <a className="land-btn solid" href={wa} target="_blank" rel="noopener noreferrer"><WhatsApp /><span>Falar no WhatsApp</span></a>
          <a className="land-btn" href={unit.instagram} target="_blank" rel="noopener noreferrer"><Instagram /><span>Instagram</span></a>
        </div>
      </section>

      <footer className="land-wrap land-foot">
        <span>Connect Academy · parte do ecossistema RFEITOSA Group</span>
        <button className="land-back" onClick={() => closeLanding()}>← Voltar</button>
      </footer>
    </div>
  );
}

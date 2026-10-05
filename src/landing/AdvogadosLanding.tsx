import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLanding } from './store';
import { closeLanding } from './controller';
import { ADVOGADOS } from './advogados';
import { scheduleWarm } from '../three/warm';
import { Arrow, Instagram, WhatsApp } from '../components/Icons';
import logo from '../assets/advogados/logo.webp';
import hero from '../assets/advogados/hero.webp';

const PHOTO = import.meta.glob<string>('../assets/advogados/s-*.webp', { eager: true, import: 'default' });
const photo = (id: string) => PHOTO[`../assets/advogados/s-${id}.webp`];
const L = ADVOGADOS.links;

/**
 * Folder da R.Feitosa Advogados: resumo do escritório que sempre leva ao site oficial,
 * sem substituí-lo. Mesma URL; abre em círculo a partir da logo explodida.
 */
export default function AdvogadosLanding() {
  const s = useLanding();
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const active = s?.key === 'feitosa-advogados';
  const on = active && s.phase === 'open';

  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    html.style.overflow = 'hidden';
    root.current?.scrollTo(0, 0);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLanding(); };
    addEventListener('keydown', onKey);
    return () => { html.style.overflow = ''; removeEventListener('keydown', onKey); };
  }, [active]);
  useEffect(() => { if (on) closeBtn.current?.focus({ preventScroll: true }); }, [on]);

  const [armed, setArmed] = useState(false);
  useEffect(() => scheduleWarm(() => setArmed(true)), []);
  useEffect(() => { if (active) setArmed(true); }, [active]);

  const wa = `https://wa.me/${L.whatsapp}?text=${encodeURIComponent(L.whatsappText)}`;
  const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

  return (
    <div
      ref={root}
      className={`land land-adv${active ? ' active' : ''}${on ? ' on' : ''}`}
      style={s ? ({ '--x': `${s.x}px`, '--y': `${s.y}px` } as CSSProperties) : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="R.Feitosa Advogados"
      aria-hidden={!active}
      {...(!active ? { inert: '' } : {})}
    >
      {armed && (<>
      <div className="ra-strip">
        <span>Áreas de atuação, equipe e contato completos no site oficial</span>
        <a href={L.site} {...ext}>Acessar o site →</a>
      </div>

      <div className="ra-wrap ra-nav">
        <button ref={closeBtn} className="ra-back" onClick={() => closeLanding()}>
          <span aria-hidden="true">←</span> Voltar ao RF Group
        </button>
        <a className="ra-btn ghost sm" href={L.site} {...ext}>Site oficial</a>
      </div>

      {/* capa: fachada da sede */}
      <section className="ra-hero" style={{ '--hero': `url(${hero})` } as CSSProperties}>
        <div className="ra-wrap ra-hero-in">
          <img className="ra-logo" src={logo} alt="R.Feitosa Advogados Associados" width={700} height={292} />
          <h1>{ADVOGADOS.title[0]}<br /><b>{ADVOGADOS.title[1]}</b></h1>
          <p className="ra-lead">{ADVOGADOS.lead}</p>
          <div className="ra-cta">
            <a className="ra-btn light" href={L.site} {...ext}><span>Acessar o site oficial</span><Arrow /></a>
            <a className="ra-btn ghost" href={wa} {...ext}><WhatsApp /><span>Agende uma consulta</span></a>
          </div>
          <div className="ra-nums">
            {ADVOGADOS.numbers.map((n) => <div key={n.l}><b>{n.v}</b><span>{n.l}</span></div>)}
          </div>
        </div>
      </section>

      {/* áreas + sócios */}
      <section className="ra-sec">
        <div className="ra-wrap">
          <p className="ra-kicker">Excelência jurídica</p>
          <h2 className="ra-h2">Em diversas <b>áreas</b></h2>
          <ul className="ra-chips">{ADVOGADOS.areas.map((a) => <li key={a}>{a}</li>)}</ul>

          <h2 className="ra-h2 ra-gap">Nossos <b>sócios</b></h2>
          <ul className="ra-team">
            {ADVOGADOS.partners.map((p) => (
              <li key={p.id}>
                <img src={photo(p.id)} alt="" width={440} height={587} loading="lazy" />
                <div><h3>{p.name}</h3><span>{p.role}</span></div>
              </li>
            ))}
          </ul>

          <div className="ra-facts">
            <div><span>Reconhecimentos</span><p>{ADVOGADOS.awards.join(' · ')}</p></div>
            <div><span>Unidades no Ceará</span><p>{ADVOGADOS.offices.join(' · ')}</p></div>
          </div>
        </div>
      </section>

      {/* chamada para o site oficial */}
      <section className="ra-final">
        <div className="ra-wrap">
          <p className="ra-kicker">Fale com o escritório</p>
          <h2>Seu desafio jurídico, <b>nossa estratégia.</b></h2>
          <p>Conheça as áreas de atuação, a história e a equipe completa no site oficial da R.Feitosa Advogados.</p>
          <a className="ra-site" href={L.site} {...ext}>
            <span>Site oficial</span>
            <b>R.Feitosa Advogados</b>
            <Arrow />
          </a>
          <div className="ra-cta center">
            <a className="ra-btn ghost" href={wa} {...ext}><WhatsApp /><span>WhatsApp</span></a>
            <a className="ra-btn ghost" href={L.instagram} {...ext}><Instagram /><span>Instagram</span></a>
            <a className="ra-btn ghost" href={L.linkedin} {...ext}><span>LinkedIn</span></a>
            <a className="ra-btn ghost" href={`mailto:${L.email}`}><span>{L.email}</span></a>
          </div>
        </div>
      </section>

      <div className="ra-wrap ra-foot">
        <span>R.Feitosa Advogados Associados · ecossistema RF Group · <a href={L.site} {...ext}>site oficial</a></span>
        <button className="ra-back" onClick={() => closeLanding()}>← Voltar ao RF Group</button>
      </div>
      </>)}
    </div>
  );
}

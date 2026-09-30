import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useLanding } from './store';
import { closeLanding } from './controller';
import { ACADEMY } from './academy';
import { UNITS, WHATSAPP } from '../data';
import Logo3D from '../three/Logo3D';
import { scheduleWarm } from '../three/warm';
import { Arrow, Instagram, WhatsApp } from '../components/Icons';
import logoAzul from '../assets/academy/logo-azul.webp';
import logoDourado from '../assets/academy/logo-dourado.webp';
import slogan from '../assets/academy/slogan.webp';
import atlas from '../assets/academy/atlas.webp';
import turma from '../assets/academy/turma.webp';
import seta from '../assets/academy/seta.webp';
import alvoVidro from '../assets/academy/alvo-vidro.webp';
import iconMed from '../assets/academy/icon-med.webp';
import iconJuris from '../assets/academy/icon-juris.webp';
import iconRh from '../assets/academy/icon-rh.webp';
import iconTech from '../assets/academy/icon-tech.webp';

const unit = UNITS.find((u) => u.id === 'connect-academy')!;
const TRACK_ICON: Record<string, string> = { med: iconMed, juris: iconJuris, rh: iconRh, tech: iconTech };

// ícones dos pilares (traço simples, na cor do texto)
const PILLAR_ICON: Record<string, ReactNode> = {
  target: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="13" r="8" /><circle cx="11" cy="13" r="4" /><path d="m11 13 9-9m-3 0h3v3" /></svg>,
  chart: <svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="13" width="4" height="8" rx="1" /><rect x="10" y="8" width="4" height="13" rx="1" /><rect x="17" y="3" width="4" height="18" rx="1" /></svg>,
  people: <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="3.2" /><circle cx="5" cy="9" r="2.4" /><circle cx="19" cy="9" r="2.4" /><path d="M6 20a6 6 0 0 1 12 0zM0 19a4.5 4.5 0 0 1 6.5-4 7.5 7.5 0 0 0-1.9 4zM24 19a4.5 4.5 0 0 0-6.5-4 7.5 7.5 0 0 1 1.9 4z" /></svg>,
  diamond: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3h12l4 6-10 12L2 9zM4.6 9h4.3L12 17.8zM15.1 9h4.3L12 17.8zM10.3 9h3.4L12 15z" fillRule="evenodd" /></svg>,
};
const Calendar = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
const Person = () => <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0z" /></svg>;
const Check = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m4 12 5 5L20 6" /></svg>;

/** Landing da Connect Academy (conteúdo do folder 2026): mesma URL, abre em círculo a partir da logo explodida. */
export default function AcademyLanding() {
  const s = useLanding();
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const active = s?.key === 'connect-academy';
  const on = active && s.phase === 'open';

  // trava a rolagem da página por trás e fecha com Esc
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

  // conteúdo (imagens do folder) só entra em segundo plano após a abertura do site, ou no clique
  const [armed, setArmed] = useState(false);
  useEffect(() => scheduleWarm(() => setArmed(true)), []);
  useEffect(() => { if (active) setArmed(true); }, [active]);

  const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(ACADEMY.whatsappText)}`;
  const go = (id: string) => root.current?.querySelector(`#ca-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // fica montada desde o carregamento (invisível): a logo 3D é preparada em segundo plano
  return (
    <div
      ref={root}
      className={`land land-academy${active ? ' active' : ''}${on ? ' on' : ''}`}
      style={s ? ({ '--x': `${s.x}px`, '--y': `${s.y}px` } as CSSProperties) : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Connect Academy"
      aria-hidden={!active}
      {...(!active ? { inert: '' } : {})}
    >
      {armed && (<>
      {/* topo */}
      <div className="ca-wrap ca-nav">
        <button ref={closeBtn} className="ca-back" onClick={() => closeLanding()}>
          <span aria-hidden="true">←</span> Voltar ao RF Group
        </button>
        <img className="ca-nav-logo" src={logoAzul} alt="Connect Academy" width={190} height={55} />
        <a className="ca-btn ghost" href={wa} target="_blank" rel="noopener noreferrer">Fale com a equipe</a>
      </div>

      {/* hero: "O mundo mudou, você percebeu?" + Atlas carregando a Academy */}
      <section className="ca-wrap ca-hero">
        <div className="ca-hero-txt">
          <img className="ca-slogan" src={slogan} alt="O mundo mudou, você percebeu?" width={922} height={519} />
          <p className="ca-kicker">{ACADEMY.heroTitle.join(' ')}</p>
          <p className="ca-sub">{ACADEMY.heroSub}</p>
          <div className="ca-cta">
            <a className="ca-btn solid" href={wa} target="_blank" rel="noopener noreferrer"><WhatsApp /><span>Fale com nossa equipe</span></a>
            <button className="ca-btn" onClick={() => go('jornada')}><span>Ver formações</span><Arrow /></button>
          </div>
        </div>
        <div className="ca-hero-art" aria-hidden="true">
          <img className="ca-atlas" src={atlas} alt="" width={526} height={1004} />
          <div className="ca-globe">
            <Logo3D logo="connect-academy" motion="sway" className="ca-logo3d" label="Logo 3D Connect Academy" active={on} ignoreViewport />
          </div>
        </div>
      </section>

      {/* faixa */}
      <div className="ca-band">
        <div className="ca-wrap">
          <p><strong>{ACADEMY.band[0]}</strong> {ACADEMY.band[1]}</p>
          <span>{ACADEMY.tagline}</span>
        </div>
      </div>

      {/* sobre + pilares */}
      <section className="ca-about">
        <div className="ca-wrap ca-about-grid">
          <div>
            <img className="ca-about-logo" src={logoAzul} alt="Connect Academy" width={380} height={110} loading="lazy" />
            <h2>{ACADEMY.about}</h2>
          </div>
          <ul className="ca-pillars">
            {ACADEMY.pillars.map((p) => (
              <li key={p.t}><span className="ca-pi">{PILLAR_ICON[p.icon]}</span><div><h3>{p.t}</h3><p>{p.d}</p></div></li>
            ))}
          </ul>
        </div>
      </section>

      {/* jornada: Gestão Essencial | Gestão Integral | Trilhas */}
      <section className="ca-journey" id="ca-jornada" style={{ '--turma': `url(${turma})` } as CSSProperties}>
        <div className="ca-wrap">
          <h2 className="ca-h2">{ACADEMY.journeyTitle[0]}<br />{ACADEMY.journeyTitle[1]}</h2>
          <div className="ca-pills">
            <button onClick={() => go('essencial')}>Gestão <b>Essencial</b></button>
            <button onClick={() => go('integral')}>Gestão <b>Integral</b></button>
            <button onClick={() => go('trilhas')}>Trilhas <b className="gold">Especializadas</b></button>
          </div>
          <div className="ca-programs">
            {ACADEMY.programs.map((pg) => (
              <article key={pg.id} id={`ca-${pg.id}`} className="ca-program">
                <h3>{pg.name[0]}<br /><b>{pg.name[1]}</b></h3>
                <p className="ca-program-lead">{pg.lead}</p>
                <div className="ca-badges">
                  <span><Calendar />{pg.badges[0]}</span>
                  <span><Person />{pg.badges[1]}</span>
                </div>
                <h4>{pg.modulesTitle}:</h4>
                <ol className="ca-modules">
                  {pg.modules.map((m, i) => <li key={m}><span>{i + 1}</span>{m}</li>)}
                </ol>
                <h4>O que você leva</h4>
                <ul className="ca-take">
                  {pg.takeaways.map((t) => <li key={t}><Check />{t}</li>)}
                </ul>
                <small>{ACADEMY.note}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* trilhas especializadas */}
      <section className="ca-tracks" id="ca-trilhas">
        <div className="ca-wrap ca-tracks-grid">
          <div>
            <h2 className="ca-tracks-title">{ACADEMY.tracksTitle[0]}<br /><b>{ACADEMY.tracksTitle[1]}</b><br /><b>{ACADEMY.tracksTitle[2]}</b></h2>
            <a className="ca-journey-cta" href={wa} target="_blank" rel="noopener noreferrer">
              <span>{ACADEMY.tracksCta}</span>
              <img src={alvoVidro} alt="" width={274} height={281} loading="lazy" />
            </a>
          </div>
          <ul className="ca-track-list">
            {ACADEMY.tracks.map((t) => (
              <li key={t.t}>
                <img src={TRACK_ICON[t.icon]} alt="" width={64} height={64} loading="lazy" />
                <div><h3>{t.t}</h3><p>{t.d}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* "Conhecimento que gera RESULTADOS reais" */}
      <section className="ca-statement">
        <img className="ca-seta" src={seta} alt="" width={514} height={434} loading="lazy" />
        <p>
          <span><i>C</i>onhecimento</span>
          <span>que <i>G</i>era</span>
          <span className="hl">Resultados</span>
          <span>R<i>ea</i>i<i>s</i></span>
        </p>
      </section>

      {/* contato */}
      <section className="ca-contact">
        <div className="ca-wrap ca-contact-box">
          <div>
            <h2>{ACADEMY.contactTitle}</h2>
            <p>{ACADEMY.contactSub}</p>
            <div className="ca-cta">
              <a className="ca-btn gold" href={wa} target="_blank" rel="noopener noreferrer"><WhatsApp /><span>Falar no WhatsApp</span></a>
              <a className="ca-btn light" href={unit.cta.href} target="_blank" rel="noopener noreferrer"><span>Site da Academy</span><Arrow /></a>
            </div>
          </div>
          <div className="ca-contact-info">
            <img src={logoDourado} alt="Connect Academy" width={300} height={87} loading="lazy" />
            <b>{ACADEMY.city}</b>
            <a href={ACADEMY.instagram.url} target="_blank" rel="noopener noreferrer"><Instagram />{ACADEMY.instagram.handle}</a>
          </div>
        </div>
      </section>

      <div className="ca-wrap ca-foot">
        <span>Connect Academy · parte do ecossistema RFEITOSA Group</span>
        <button className="ca-back" onClick={() => closeLanding()}>← Voltar ao RF Group</button>
      </div>
      </>)}
    </div>
  );
}

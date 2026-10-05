import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLanding } from './store';
import { closeLanding } from './controller';
import { VALLEY } from './valley';
import { UNITS } from '../data';
import { scheduleWarm } from '../three/warm';
import { Arrow, Instagram, WhatsApp } from '../components/Icons';
import logo from '../assets/valley/connect-2026.svg';
import icone from '../assets/valley/icone.svg';
import hero from '../assets/valley/hero.webp';
import g1 from '../assets/valley/g1.webp';
import g2 from '../assets/valley/g2.webp';
import g3 from '../assets/valley/g3.webp';
import g4 from '../assets/valley/g4.webp';

const unit = UNITS.find((u) => u.id === 'connect-valley')!;
const L = VALLEY.links;

/** Contagem regressiva até a abertura do evento (atualiza a cada segundo, só com a landing aberta). */
function useCountdown(target: string, running: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);
  const ms = Math.max(0, new Date(target).getTime() - now);
  return { ms, d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 };
}
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Folder da Connect Valley: resumo do evento que sempre aponta para o site oficial (connectvaley.com.br),
 * sem substituí-lo. Mesma URL; abre em círculo a partir da logo explodida.
 */
export default function ValleyLanding() {
  const s = useLanding();
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const active = s?.key === 'connect-valley';
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

  // conteúdo (imagens) só entra em segundo plano após a abertura do site, ou no clique
  const [armed, setArmed] = useState(false);
  useEffect(() => scheduleWarm(() => setArmed(true)), []);
  useEffect(() => { if (active) setArmed(true); }, [active]);

  const cd = useCountdown(VALLEY.eventStart, on);
  const wa = `https://wa.me/${L.whatsapp}?text=${encodeURIComponent(L.whatsappText)}`;
  const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

  return (
    <div
      ref={root}
      className={`land land-valley${active ? ' active' : ''}${on ? ' on' : ''}`}
      style={s ? ({ '--x': `${s.x}px`, '--y': `${s.y}px` } as CSSProperties) : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Connect Valley 2026"
      aria-hidden={!active}
      {...(!active ? { inert: '' } : {})}
    >
      {armed && (<>
      {/* faixa fixa: o folder resume, o site oficial detalha */}
      <div className="cv-strip">
        <span>Programação, palestrantes e ingressos no site oficial</span>
        <a href={L.site} {...ext}>connectvaley.com.br →</a>
      </div>

      <div className="cv-wrap cv-nav">
        <button ref={closeBtn} className="cv-back" onClick={() => closeLanding()}>
          <span aria-hidden="true">←</span> Voltar ao RF Group
        </button>
        <img className="cv-nav-logo" src={icone} alt="" width={40} height={40} />
        <a className="cv-btn outline sm" href={L.site} {...ext}>Site oficial</a>
      </div>

      {/* capa */}
      <section className="cv-hero" style={{ '--hero': `url(${hero})` } as CSSProperties}>
        <span className="cv-outline" aria-hidden="true">DO INTERIOR</span>
        <div className="cv-wrap cv-hero-in">
          <img className="cv-logo" src={logo} alt="Connect Valley 2026" width={948} height={246} />
          <h1>{VALLEY.heroTitle}</h1>
          <p className="cv-lead">{VALLEY.heroSub}</p>
          <div className="cv-date"><b>{VALLEY.dateLabel}</b><span>{VALLEY.city}</span></div>
          {cd.ms > 0 && (
            <div className="cv-count" aria-label="Contagem regressiva para o evento">
              <span>O evento começa em</span>
              <div>
                <b>{pad(cd.d)}<small>dias</small></b><b>{pad(cd.h)}<small>h</small></b>
                <b>{pad(cd.m)}<small>min</small></b><b>{pad(cd.s)}<small>s</small></b>
              </div>
            </div>
          )}
          <div className="cv-cta">
            <a className="cv-btn gold" href={L.site} {...ext}><span>Acessar o site oficial</span><Arrow /></a>
            <a className="cv-btn outline" href={L.tickets} {...ext}><span>Ingressos</span></a>
          </div>
        </div>
      </section>

      <div className="cv-ticker" aria-hidden="true">
        <div>{[...VALLEY.ticker, ...VALLEY.ticker, ...VALLEY.ticker, ...VALLEY.ticker].map((t, i) => <span key={i}>{t}</span>)}</div>
      </div>

      {/* o essencial, em formato de folder */}
      <section className="cv-sec cv-about">
        <div className="cv-wrap cv-about-grid">
          <div>
            <p className="cv-kicker">Save the date · 16 e 17 de outubro</p>
            <h2 className="cv-h2">{VALLEY.aboutKicker}<br /><em>{VALLEY.aboutTitle}</em></h2>
            <p className="cv-text">{VALLEY.aboutText}</p>
            <ul className="cv-chips">{VALLEY.areas.map((a) => <li key={a.t}>{a.t}</li>)}</ul>
          </div>
          <div className="cv-numbers">
            {VALLEY.numbers.map((n) => (
              <div key={n.l}><b>{n.v}</b><span>{n.l}</span></div>
            ))}
          </div>
        </div>
      </section>

      <div className="cv-gallery" aria-label="Edições anteriores">
        {[g1, g2, g3, g4].map((g, i) => <img key={i} src={g} alt="" width={900} height={600} loading="lazy" />)}
      </div>

      {/* chamada para o site oficial */}
      <section className="cv-final">
        <div className="cv-wrap">
          <p className="cv-kicker">Tudo sobre o evento</p>
          <h2>{VALLEY.finalTitle[0]}<br />{VALLEY.finalTitle[1]} <em>{VALLEY.finalTitle[2]}</em></h2>
          <p>Programação completa, palestrantes, ingressos e patrocínio estão no site oficial do Connect Valley.</p>
          <a className="cv-site" href={L.site} {...ext}>
            <span>Site oficial</span>
            <b>connectvaley.com.br</b>
            <Arrow />
          </a>
          <div className="cv-cta center">
            <a className="cv-btn outline" href={L.app} {...ext}><span>App do evento</span></a>
            <a className="cv-btn outline" href={wa} {...ext}><WhatsApp /><span>WhatsApp</span></a>
            <a className="cv-btn outline" href={unit.instagram} {...ext}><Instagram /><span>Instagram</span></a>
          </div>
        </div>
      </section>

      <div className="cv-wrap cv-foot">
        <span>Connect Valley é uma iniciativa do RF Group · <a href={L.site} {...ext}>connectvaley.com.br</a></span>
        <button className="cv-back" onClick={() => closeLanding()}>← Voltar ao RF Group</button>
      </div>
      </>)}
    </div>
  );
}

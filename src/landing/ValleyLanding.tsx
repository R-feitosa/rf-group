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
import dBnb from '../assets/valley/d-bnb.webp';
import dHws from '../assets/valley/d-hws.webp';
import dSobral from '../assets/valley/d-sobral.webp';
import dDr from '../assets/valley/d-dr.webp';

const SPEAKER_IMG = import.meta.glob<string>('../assets/valley/sp-*.webp', { eager: true, import: 'default' });
const speakerImg = (id: string) => SPEAKER_IMG[`../assets/valley/sp-${id}.webp`];
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

/** Landing da Connect Valley em formato de folder (base: landing oficial). Mesma URL; abre em círculo a partir da logo explodida. */
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
      <div className="cv-strip">
        <span>{VALLEY.badge}</span>
        <a href={L.tickets} {...ext}>Garantir agora →</a>
      </div>

      <div className="cv-wrap cv-nav">
        <button ref={closeBtn} className="cv-back" onClick={() => closeLanding()}>
          <span aria-hidden="true">←</span> Voltar ao RF Group
        </button>
        <img className="cv-nav-logo" src={icone} alt="" width={40} height={40} />
        <a className="cv-btn outline sm" href={L.app} {...ext}>Acesse o app</a>
      </div>

      {/* capa */}
      <section className="cv-hero" style={{ '--hero': `url(${hero})` } as CSSProperties}>
        <span className="cv-outline" aria-hidden="true">DO INTERIOR</span>
        <div className="cv-wrap cv-hero-in">
          <img className="cv-logo" src={logo} alt="Connect Valley 2026" width={948} height={246} />
          <span className="cv-badge"><i />{VALLEY.badge}</span>
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
            <a className="cv-btn gold" href={L.tickets} {...ext}><span>Garantir minha vaga</span><Arrow /></a>
            <a className="cv-btn outline" href={L.app} {...ext}><span>Acesse o app</span></a>
          </div>
        </div>
      </section>

      <div className="cv-ticker" aria-hidden="true">
        <div>{[...VALLEY.ticker, ...VALLEY.ticker, ...VALLEY.ticker, ...VALLEY.ticker].map((t, i) => <span key={i}>{t}</span>)}</div>
      </div>

      {/* ecossistema + números */}
      <section className="cv-sec cv-about">
        <div className="cv-wrap cv-about-grid">
          <div>
            <p className="cv-kicker">Save the date · 16 e 17 de outubro</p>
            <h2 className="cv-h2">{VALLEY.aboutKicker}<br /><em>{VALLEY.aboutTitle}</em></h2>
            <p className="cv-text">{VALLEY.aboutText}</p>
            <h3 className="cv-h3">{VALLEY.innovationTitle[0]} <em>{VALLEY.innovationTitle[1]}</em></h3>
            <p className="cv-text">{VALLEY.innovationText}</p>
          </div>
          <div className="cv-numbers">
            {VALLEY.numbers.map((n) => (
              <div key={n.l}><b>{n.v}</b><span>{n.l}</span><p>{n.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* áreas de conteúdo */}
      <section className="cv-sec cv-areas">
        <div className="cv-wrap">
          <p className="cv-kicker">Mergulhe fundo</p>
          <h2 className="cv-h2">Áreas de <em>conteúdo</em></h2>
          <div className="cv-stages">{VALLEY.stages.map((st) => <span key={st}>{st}</span>)}</div>
          <ol className="cv-area-grid">
            {VALLEY.areas.map((a, i) => (
              <li key={a.t}><span>{String(i + 1).padStart(2, '0')}</span><h3>{a.t}</h3><p>{a.d}</p></li>
            ))}
          </ol>
        </div>
      </section>

      {/* galeria */}
      <div className="cv-gallery" aria-label="Edições anteriores">
        {[g1, g2, g3, g4].map((g, i) => <img key={i} src={g} alt="" width={900} height={600} loading="lazy" />)}
      </div>

      {/* palestrantes */}
      <section className="cv-sec cv-speakers">
        <div className="cv-wrap">
          <p className="cv-kicker">Line-up</p>
          <h2 className="cv-h2">Palestrantes <em>confirmados</em></h2>
          <ul className="cv-sp-grid">
            {VALLEY.speakers.map((sp) => (
              <li key={sp.id}>
                <img src={speakerImg(sp.id)} alt={sp.n} width={420} height={560} loading="lazy" />
                <div><b>{sp.n}</b><span>{sp.r}</span></div>
              </li>
            ))}
          </ul>
          <p className="cv-more">{VALLEY.speakersMore}</p>
        </div>
      </section>

      {/* benefícios */}
      <section className="cv-sec cv-benefits">
        <div className="cv-wrap cv-ben-grid">
          <div>
            <p className="cv-kicker">O que você leva</p>
            <h2 className="cv-h2">Benefícios e <em>experiências</em></h2>
            <p className="cv-text">Muito além das palestras: certificação, oportunidades e conexões que seguem depois do evento.</p>
            <a className="cv-btn outline" href={L.app} {...ext}><span>Aplicativo oficial</span><Arrow /></a>
          </div>
          <ul className="cv-ben-list">
            {VALLEY.benefits.map((b) => <li key={b.t}><h3>{b.t}</h3><p>{b.d}</p></li>)}
          </ul>
        </div>
      </section>

      {/* ingressos */}
      <section className="cv-sec cv-tickets">
        <div className="cv-wrap">
          <p className="cv-kicker">Vendas iniciadas</p>
          <h2 className="cv-h2">Garanta seu <em>lugar</em></h2>
          <div className="cv-tk-grid">
            {VALLEY.tickets.map((t) => (
              <div key={t.name} className={`cv-tk ${t.status}`}>
                {t.status === 'current' && <span className="cv-tk-tag">Lote atual</span>}
                <h3>{t.name}</h3>
                <b>{t.price}</b>
                <ul>{VALLEY.ticketPerks.map((p) => <li key={p}>{p}</li>)}</ul>
                {t.status === 'current'
                  ? <a className="cv-btn gold" href={L.tickets} {...ext}><span>Comprar agora</span></a>
                  : <span className="cv-tk-state">{t.status === 'closed' ? 'Encerrado' : 'Em breve'}</span>}
              </div>
            ))}
          </div>
          <p className="cv-note">Valores conforme a landing oficial; confira a disponibilidade na página de ingressos.</p>
        </div>
      </section>

      {/* construtores do vale */}
      <section className="cv-sec cv-sponsors">
        <div className="cv-wrap">
          <p className="cv-kicker">Quem faz acontecer</p>
          <h2 className="cv-h2">Construtores <em>do Vale</em></h2>
          <div className="cv-tiers">{VALLEY.sponsorTiers.map((t) => <span key={t.t}><b>{t.n}</b>{t.t}</span>)}</div>
          <div className="cv-diamond">
            {[[dBnb, 'Banco do Nordeste'], [dHws, 'Grupo HWS'], [dSobral, 'Prefeitura de Sobral'], [dDr, 'D&R']].map(([src, alt]) => (
              <img key={alt} src={src} alt={alt} loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      {/* fechamento */}
      <section className="cv-final">
        <div className="cv-wrap">
          <h2>{VALLEY.finalTitle[0]}<br />{VALLEY.finalTitle[1]} <em>{VALLEY.finalTitle[2]}</em></h2>
          <p>{VALLEY.dateLabel} · {VALLEY.city}. {VALLEY.finalSub}</p>
          <div className="cv-cta center">
            <a className="cv-btn gold" href={L.tickets} {...ext}><span>Garantir minha vaga</span><Arrow /></a>
            <a className="cv-btn outline" href={wa} {...ext}><WhatsApp /><span>Suporte WhatsApp</span></a>
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

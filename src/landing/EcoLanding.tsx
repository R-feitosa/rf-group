import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useLanding } from './store';
import { closeLanding, lite } from './controller';
import { ECO } from './eco';
import { EcoSymbol } from './ecoSymbol';
import { scheduleWarm } from '../three/warm';
import { Instagram } from '../components/Icons';
import maze from '../assets/eco/maze.webp';
import xadrez from '../assets/eco/xadrez.webp';

const L = ECO.links;
const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

const CHIP_ICON: Record<string, ReactNode> = {
  people: <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.2" /><path d="M3.5 21a8.5 8.5 0 0 1 17 0z" /></svg>,
  chart: <svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="13" width="4.5" height="8" rx="1" /><rect x="9.75" y="8" width="4.5" height="13" rx="1" /><rect x="16.5" y="3" width="4.5" height="18" rx="1" /></svg>,
  eco: <EcoSymbol />,
};
const ArrowDR = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 8v10H8" /></svg>;

/** Faixa dos posts da marca: © · Instagram · site (topo e rodapé). */
function Bar({ top, dark }: { top?: boolean; dark?: boolean }) {
  return (
    <div className={`eco-bar${top ? ' top' : ''}${dark ? ' dark' : ''}`}>
      <span>© 2025 Eco Soluções</span>
      <a href={L.instagram} {...ext}>{L.instagramLabel}</a>
      <a href={L.site} {...ext}>{L.siteLabel}</a>
    </div>
  );
}

/** Assinatura da Eco toda em cinza: o símbolo da moeda 3D + "ECO Soluções Empresariais". */
function Lockup() {
  return (
    <div className="eco-lockup" role="img" aria-label="Eco Soluções Empresariais">
      <EcoSymbol />
      <b>ECO</b>
      <span>Soluções<br /><strong>Empresariais</strong></span>
    </div>
  );
}

/**
 * Folder da Eco Soluções: a moeda explode e se reconstrói como labirinto 3D (src/three/explode.ts, modo maze),
 * que fica como fundo fixo da landing. Conteúdo na linguagem dos posts da marca; sempre leva ao site oficial.
 */
export default function EcoLanding() {
  const s = useLanding();
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const active = s?.key === 'eco-solucoes';
  const on = active && s.phase === 'open';
  // sem explosão (aparelho fraco / movimento reduzido): fundo e conteúdo entram sem esperar o labirinto 3D.
  // Calculado no render (não em efeito): a classe precisa existir antes de ".on" disparar as transições.
  const instant = active && lite();

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

  // destaques "selecionados" (cinza) se desenham quando entram na tela
  useEffect(() => {
    const el = root.current;
    if (!on || !el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('go'); io.unobserve(e.target); }
    }), { root: el, threshold: 0.6 });
    el.querySelectorAll('.eco-hl').forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [on]);

  const st = ECO.strategy, cs = ECO.case, fn = ECO.final;

  return (
    <div
      ref={root}
      className={`land land-eco${active ? ' active' : ''}${on ? ' on' : ''}${instant ? ' instant' : ''}`}
      style={s ? ({ '--x': `${s.x}px`, '--y': `${s.y}px` } as CSSProperties) : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Eco Soluções"
      aria-hidden={!active}
      {...(!active ? { inert: '' } : {})}
    >
      {armed && (<>
      {/* fundo fixo: recebe o labirinto 3D montado na explosão (data-maze-host);
          a imagem da referência só aparece sem a animação (aparelho fraco / movimento reduzido) */}
      <div className="eco-bg" data-maze-host aria-hidden="true"><img src={maze} alt="" width={1080} height={1080} /></div>

      <Bar top />
      <div className="eco-wrap eco-nav">
        <button ref={closeBtn} className="eco-back" onClick={() => closeLanding()}>
          <span aria-hidden="true">←</span> Voltar ao RF Group
        </button>
        <a className="eco-btn line sm" href={L.site} {...ext}>Site oficial</a>
      </div>

      {/* capa clara, sobre o labirinto */}
      <section className="eco-wrap eco-hero eco-in">
        <Lockup />
        <h1>{ECO.hero.title[0]}<br />{ECO.hero.title[1]} <b>{ECO.hero.title[2]}</b></h1>
        <p className="eco-lead">{ECO.hero.lead}</p>
        <div className="eco-cta">
          <a className="eco-btn solid" href={L.site} {...ext}><span>Acessar o site oficial</span><ArrowDR /></a>
          <a className="eco-btn line" href={L.instagram} {...ext}><Instagram /><span>{L.instagramLabel}</span></a>
        </div>
        <EcoSymbol className="eco-mark" />
      </section>

      {/* xadrez: "Você precisa de estratégia!" */}
      <section className="eco-dark eco-chess eco-in">
        <div className="eco-wrap">
          <figure><img src={xadrez} alt="Rei dourado de pé entre peças caídas, diante do símbolo da Eco" width={1080} height={800} loading="lazy" /></figure>
          <h2><span className="eco-hl box">{st.title[0]}</span> {st.title[1]}<br />{st.title[2]}</h2>
          <ul className="eco-chips">
            {st.chips.map((c) => (
              <li key={c.t}><i>{CHIP_ICON[c.icon]}</i><span>{c.b && <b>{c.b} </b>}{c.t}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* caso de virada (post da marca) */}
      <section className="eco-wrap eco-case eco-in">
        <div className="eco-case-card">
          <p className="eco-case-lead">{cs.problem[0]}<b>{cs.problem[1]}</b>{cs.problem[2]}</p>
          <p className="eco-case-turn">{cs.turn}</p>
          <ul className="eco-tri">{cs.wins.map((w) => <li key={w}>{w}</li>)}</ul>
          <p className="eco-case-q">{cs.question[0]}<b>{cs.question[1]}</b></p>
        </div>
        <EcoSymbol className="eco-case-mark" />
      </section>

      {/* fechamento escuro: seleção de texto + botão de vidro para o site oficial */}
      <section className="eco-dark eco-final eco-in">
        <div className="eco-wrap">
          <h2>{fn.title[0]} <span className="eco-hl sel">{fn.title[1]}</span></h2>
          <p className="eco-sub">{fn.sub}</p>
          <a className="eco-glass" href={L.site} {...ext}>
            <ArrowDR />
            <span><small>Site oficial</small>{L.siteLabel}</span>
          </a>
          <div className="eco-final-links">
            <a href={L.instagram} {...ext}><Instagram />{L.instagramLabel}</a>
            <button className="eco-back light" onClick={() => closeLanding()}>← Voltar ao RF Group</button>
          </div>
        </div>
        <Bar dark />
      </section>
      </>)}
    </div>
  );
}

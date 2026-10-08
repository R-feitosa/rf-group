import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLanding } from './store';
import { closeLanding, lite } from './controller';
import { ECO } from './eco';
import { scheduleWarm } from '../three/warm';
import { Arrow, Instagram } from '../components/Icons';
import logo from '../assets/eco/logo.webp';
import maze from '../assets/eco/maze.webp';

const L = ECO.links;

/** Faixa da referência: © · Instagram · site (topo e rodapé). */
function Bar({ top }: { top?: boolean }) {
  const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;
  return (
    <div className={`eco-bar${top ? ' top' : ''}`}>
      <span>© 2025 Eco Soluções</span>
      <a href={L.instagram} {...ext}>{L.instagramLabel}</a>
      <a href={L.site} {...ext}>{L.siteLabel}</a>
    </div>
  );
}

/**
 * Folder da Eco Soluções (1º protótipo): a moeda explode e se reconstrói como labirinto 3D
 * (src/three/explode.ts, modo maze), que fica como fundo fixo da landing. Sempre leva ao site oficial.
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

  const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

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
        <a className="eco-btn ghost sm" href={L.site} {...ext}>Site oficial</a>
      </div>

      <section className="eco-wrap eco-hero eco-in">
        <img className="eco-logo" src={logo} alt="Eco Soluções Empresariais" width={760} height={162} />
        <h1>{ECO.title[0]}<br />{ECO.title[1]} <b>{ECO.title[2]}</b></h1>
        <p className="eco-lead">{ECO.lead}</p>
        <div className="eco-cta">
          <a className="eco-btn red" href={L.site} {...ext}><span>Acessar o site oficial</span><Arrow /></a>
          <a className="eco-btn ghost" href={L.instagram} {...ext}><Instagram /><span>{L.instagramLabel}</span></a>
        </div>
        <div className="eco-nums">
          {ECO.numbers.map((n) => <div key={n.l}><b>{n.v}</b><span>{n.l}</span></div>)}
        </div>
      </section>

      {/* o caminho: três frentes ligadas por uma trilha, como a saída do labirinto */}
      <section className="eco-wrap eco-path eco-in">
        <p className="eco-kicker">O caminho até a <b>{ECO.tagline.toLowerCase()}</b></p>
        <ol>
          {ECO.path.map((p) => (
            <li key={p.n}><span>{p.n}</span><h2>Consultoria <b>{p.t}</b></h2><p>{p.d}</p></li>
          ))}
        </ol>
      </section>

      <section className="eco-wrap eco-final eco-in">
        <p className="eco-kicker">{ECO.kicker}</p>
        <h2>Encontre a saída <b>com a Eco.</b></h2>
        <a className="eco-site" href={L.site} {...ext}>
          <span>Site oficial</span>
          <b>{L.siteLabel}</b>
          <Arrow />
        </a>
        <button className="eco-back dark" onClick={() => closeLanding()}>← Voltar ao RF Group</button>
      </section>

      <Bar />
      </>)}
    </div>
  );
}

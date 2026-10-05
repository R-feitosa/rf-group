import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLanding } from './store';
import { closeLanding } from './controller';
import { IMOVEIS } from './imoveis';
import { scheduleWarm } from '../three/warm';
import { Arrow, Instagram, WhatsApp } from '../components/Icons';
import logo from '../assets/imoveis/logo.webp';
import hero from '../assets/imoveis/hero.webp';

const PHOTO = import.meta.glob<string>('../assets/imoveis/p-*.webp', { eager: true, import: 'default' });
const photo = (id: string) => PHOTO[`../assets/imoveis/p-${id}.webp`];
const L = IMOVEIS.links;

/**
 * Folder da Feitosa Imóveis: resumo do portfólio que sempre leva ao catálogo oficial (rfeitosaimoveis.online),
 * sem substituí-lo. Mesma URL; abre em círculo a partir da logo explodida.
 */
export default function ImoveisLanding() {
  const s = useLanding();
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const active = s?.key === 'feitosa-imobiliarias';
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
      className={`land land-imoveis${active ? ' active' : ''}${on ? ' on' : ''}`}
      style={s ? ({ '--x': `${s.x}px`, '--y': `${s.y}px` } as CSSProperties) : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Feitosa Imóveis"
      aria-hidden={!active}
      {...(!active ? { inert: '' } : {})}
    >
      {armed && (<>
      <div className="fi-strip">
        <span>Catálogo completo, fotos e detalhes no site oficial</span>
        <a href={L.site} {...ext}>{L.siteLabel} →</a>
      </div>

      <div className="fi-wrap fi-nav">
        <button ref={closeBtn} className="fi-back" onClick={() => closeLanding()}>
          <span aria-hidden="true">←</span> Voltar ao RF Group
        </button>
        <a className="fi-btn ghost sm" href={L.site} {...ext}>Site oficial</a>
      </div>

      {/* capa */}
      <section className="fi-hero" style={{ '--hero': `url(${hero})` } as CSSProperties}>
        <div className="fi-wrap fi-hero-in">
          <img className="fi-logo" src={logo} alt="Feitosa Participações Imobiliárias" width={803} height={195} />
          <p className="fi-kicker">{IMOVEIS.kicker}</p>
          <h1>{IMOVEIS.title[0]} <em>{IMOVEIS.title[1]}</em></h1>
          <p className="fi-lead">{IMOVEIS.lead}</p>
          <div className="fi-nums">
            {IMOVEIS.numbers.map((n) => <div key={n.l}><b>{n.v}</b><span>{n.l}</span></div>)}
          </div>
          <div className="fi-cta">
            <a className="fi-btn gold" href={L.site} {...ext}><span>Ver catálogo completo</span><Arrow /></a>
            <a className="fi-btn ghost" href={wa} {...ext}><WhatsApp /><span>Falar no WhatsApp</span></a>
          </div>
        </div>
      </section>

      {/* portfólio por categoria */}
      <section className="fi-sec">
        <div className="fi-wrap">
          {IMOVEIS.categories.map((c) => (
            <div key={c.t} className="fi-cat">
              <h2>{c.t}</h2>
              <ul className="fi-grid">
                {c.items.map((p) => (
                  <li key={p.id}>
                    <a href={L.site} {...ext} aria-label={`${p.name} — ver no site oficial`}>
                      <img src={photo(p.id)} alt="" width={560} height={420} loading="lazy" />
                      <span className="fi-tag">{p.tag}</span>
                      <div>
                        <h3>{p.name}</h3>
                        <small>{p.place}</small>
                        <p><span>{p.priceLabel} a partir de</span> {p.price}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="fi-note">{IMOVEIS.priceNote}</p>
        </div>
      </section>

      {/* chamada para o site oficial */}
      <section className="fi-final">
        <div className="fi-wrap">
          <p className="fi-kicker">Agende sua visita</p>
          <h2>Encontre o imóvel <em>certo para você.</em></h2>
          <p>Fotos, endereços e tudo o que está incluso em cada imóvel estão no catálogo oficial.</p>
          <a className="fi-site" href={L.site} {...ext}>
            <span>Catálogo oficial</span>
            <b>{L.siteLabel}</b>
            <Arrow />
          </a>
          <div className="fi-cta center">
            <a className="fi-btn ghost" href={wa} {...ext}><WhatsApp /><span>WhatsApp</span></a>
            <a className="fi-btn ghost" href={L.instagram} {...ext}><Instagram /><span>Instagram</span></a>
          </div>
        </div>
      </section>

      <div className="fi-wrap fi-foot">
        <span>Feitosa Participações Imobiliárias · ecossistema RF Group · <a href={L.site} {...ext}>{L.siteLabel}</a></span>
        <button className="fi-back" onClick={() => closeLanding()}>← Voltar ao RF Group</button>
      </div>
      </>)}
    </div>
  );
}

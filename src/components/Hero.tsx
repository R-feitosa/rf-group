import { lazy, Suspense } from 'react';
import NetworkCanvas from './NetworkCanvas';
import { Arrow } from './Icons';

const HeroScene = lazy(() => import('../three/HeroScene'));

// padrão da marca: palavra leve + palavra em negrito
const WORDS: [string, boolean][] = [['Crescimento', false], ['sustentável,', true], ['solidez', false], ['e', false], ['visão.', true]];

export default function Hero({ ready }: { ready: boolean }) {
  return (
    <section className="hero">
      <NetworkCanvas />
      <div className="wrap">
        <div>
          <div className="eyebrow fade" style={{ color: '#c9cdf0' }}>Ecossistema empresarial</div>
          <h1 aria-label="Crescimento sustentável, com solidez e visão estratégica">
            {WORDS.map(([w, em], i) => (
              <span key={w}>
                <span className="w" aria-hidden="true"><i style={{ transitionDelay: `${0.5 + i * 0.12}s` }}>{em ? <b>{w}</b> : w}</i></span>
                {i === 1 ? <br /> : ' '}
              </span>
            ))}
          </h1>
          <p className="lead fade" style={{ transitionDelay: '1.2s' }}>
            O grupo nasceu com o propósito de impulsionar o crescimento sustentável de seus clientes, reunindo advocacia,
            consultoria, eventos, educação e imóveis sob uma mesma visão estratégica.
          </p>
          <div className="cta fade" style={{ transitionDelay: '1.4s' }}>
            <a href="#empresas" className="btn light mag"><span>Conheça o grupo</span><Arrow /></a>
            <a href="#contato" className="btn light mag" style={{ borderColor: 'rgba(255,255,255,.3)' }}><span>Fale conosco</span></a>
          </div>
        </div>
        <div className="stage fade" style={{ transitionDelay: '.8s' }} id="stage">
          <div className="orb" /><div className="ring r1" /><div className="ring r2" />
          {ready && (
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          )}
          <p className="stage-hint">Passe o mouse nas marcas em órbita</p>
        </div>
      </div>
      <div className="scroll"><span>Role para explorar</span><i /></div>
    </section>
  );
}

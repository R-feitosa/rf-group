import { INSTAGRAM_GROUP, RH_EMAIL, UNITS, WHATSAPP, WHATSAPP_LABEL } from '../data';
import { Arrow, Instagram, WhatsApp } from './Icons';
import BrandLogo from './BrandLogo';

// crédito ao desenvolvedor: discreto (aparece por inteiro no hover/foco)
const DEV = { name: 'Ruan Pereira', url: 'https://www.linkedin.com/in/ruan-pereira-do-nascimento-ab6a45228/' };

const NAV = [
  { href: '#quem-somos', label: 'Quem somos' },
  { href: '#empresas', label: 'Empresas' },
  { href: '#numeros', label: 'Números' },
  { href: '#contato', label: 'Contato' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <>
      <footer>
        <div className="wrap">
          <div className="fcta">
            <p>Vamos construir o <strong>próximo passo do seu negócio?</strong></p>
            <a className="btn light" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">
              <span>Falar no WhatsApp</span><Arrow />
            </a>
          </div>

          <div className="fcols">
            <div className="fbrand">
              <a href="#topo" className="brand" aria-label="RFEITOSA Group — voltar ao topo"><BrandLogo variant="mono" /></a>
              <p>Ecossistema empresarial que reúne advocacia, consultoria, eventos, educação e imóveis sob uma mesma visão estratégica.</p>
              <div className="fsocial">
                <a href={INSTAGRAM_GROUP} target="_blank" rel="noopener noreferrer" aria-label="Instagram do RFEITOSA Group"><Instagram /></a>
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsApp /></a>
              </div>
            </div>

            <div className="fcol" role="navigation" aria-label="Empresas do grupo">
              <h4>Empresas</h4>
              <ul>
                {UNITS.map((u) => <li key={u.id}><a href={`#${u.id}`}>{u.name}</a></li>)}
              </ul>
            </div>

            <div className="fcol" role="navigation" aria-label="Navegação do rodapé">
              <h4>Navegação</h4>
              <ul>
                {NAV.map((n) => <li key={n.href}><a href={n.href}>{n.label}</a></li>)}
              </ul>
            </div>

            <div className="fcol">
              <h4>Contato</h4>
              <ul>
                <li><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">{WHATSAPP_LABEL}</a></li>
                <li><a href={`mailto:${RH_EMAIL}`}>{RH_EMAIL}</a></li>
                <li><a href={INSTAGRAM_GROUP} target="_blank" rel="noopener noreferrer">@rfeitosagroup</a></li>
              </ul>
            </div>
          </div>

          <div className="copy">
            <span>© {year} RFeitosa Group. Todos os direitos reservados.</span>
            <a className="dev" href={DEV.url} target="_blank" rel="noopener noreferrer" aria-label={`Desenvolvido por ${DEV.name} (LinkedIn)`}>
              <span className="dev-mark" aria-hidden="true">&lt;/&gt;</span>
              <span className="dev-text">Desenvolvido por <b>{DEV.name}</b></span>
            </a>
          </div>
        </div>
      </footer>
      <a className="wa" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsApp /></a>
    </>
  );
}

import { INSTAGRAM_GROUP, RH_EMAIL, WHATSAPP, WHATSAPP_LABEL } from '../data';
import { WhatsApp } from './Icons';

export default function Footer() {
  return (
    <>
      <footer>
        <div className="wrap">
          <div className="fgrid">
            <a href="#topo" className="brand">RFEITOSA<small>GROUP</small></a>
            <div className="social">
              <a href={INSTAGRAM_GROUP} target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a href={`mailto:${RH_EMAIL}`}>E-mail</a>
            </div>
          </div>
          <div className="copy"><span>© {new Date().getFullYear()} RFeitosa Group. Todos os direitos reservados.</span><span>{WHATSAPP_LABEL}</span></div>
        </div>
      </footer>
      <a className="wa" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsApp /></a>
    </>
  );
}

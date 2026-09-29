import { useState, type FormEvent } from 'react';
import { RH_EMAIL, WHATSAPP } from '../data';
import { Arrow } from './Icons';
import Reveal, { Eyebrow } from './Reveal';

export default function Contact() {
  const [f, setF] = useState({ nome: '', email: '', msg: '' });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = `Olá! Sou ${f.nome}${f.email ? ` (${f.email})` : ''}.\n\n${f.msg}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t)}`, '_blank', 'noopener');
  };
  return (
    <section className="contact" id="contato">
      <div className="wrap grid">
        <Reveal variant="left" className="card light">
          <Eyebrow>Fale conosco</Eyebrow>
          <h3>Vamos conversar sobre o seu negócio.</h3>
          <form onSubmit={submit}>
            <div className="f"><input id="nm" placeholder=" " required value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /><label htmlFor="nm">Seu nome</label></div>
            <div className="f"><input id="em" type="email" placeholder=" " value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /><label htmlFor="em">E-mail</label></div>
            <div className="f"><textarea id="ms" rows={3} placeholder=" " required value={f.msg} onChange={(e) => setF({ ...f, msg: e.target.value })} /><label htmlFor="ms">Como podemos ajudar?</label></div>
            <button className="btn solid mag" type="submit" style={{ justifySelf: 'start' }}><span>Enviar mensagem</span><Arrow /></button>
          </form>
        </Reveal>
        <Reveal variant="right" className="card dark">
          <Eyebrow style={{ color: '#e5a0a6' }}>Banco de talentos</Eyebrow>
          <h3>Quer fazer parte de um ecossistema inovador?</h3>
          <p>Envie seu currículo e conheça as oportunidades nas empresas do grupo.</p>
          <a className="mail" href={`mailto:${RH_EMAIL}`}>{RH_EMAIL}</a><br />
          <a className="btn light mag" href={`mailto:${RH_EMAIL}?subject=Banco%20de%20Talentos`}><span>Cadastrar currículo</span><Arrow /></a>
        </Reveal>
      </div>
    </section>
  );
}

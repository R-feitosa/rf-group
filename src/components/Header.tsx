import { useEffect, useState } from 'react';
import BrandLogo from './BrandLogo';

const LINKS = [
  { href: '#quem-somos', label: 'Quem somos' },
  { href: '#empresas', label: 'Empresas' },
  { href: '#numeros', label: 'Números' },
  { href: '#contato', label: 'Contato' },
];

export default function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setSolid(scrollY > 60);
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`${solid ? 'solid' : ''} ${open ? 'menu-open' : ''}`.trim()}>
      <div className="wrap nav">
        <a href="#topo" className="brand" aria-label="RFEITOSA Group — início"><BrandLogo /></a>
        <nav id="nav">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}><a href={l.href} onClick={() => setOpen(false)}>{l.label}</a></li>
            ))}
          </ul>
        </nav>
        <button className="burger" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} aria-controls="nav" onClick={() => setOpen((o) => !o)}>
          <i /><i />
        </button>
      </div>
    </header>
  );
}

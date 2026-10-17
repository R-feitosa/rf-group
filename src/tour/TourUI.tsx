import { useEffect, useRef, useState } from 'react';
import { useTour, startTour, stopTour, resumeTour, pauseTour, type TourMode } from './tour';
import BrandLogo from '../components/BrandLogo';

const Play = () => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>;
const Screen = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>;

/** Escolha da apresentação automática (fica no rodapé). */
export function TourPicker() {
  const pick = (m: TourMode) => startTour(m, true);
  return (
    <div className="tour-pick" data-tour-ui>
      <span>Apresentação automática</span>
      <button type="button" onClick={() => pick('loop')}><Play />Em loop</button>
      <button type="button" onClick={() => pick('estande')}><Screen />Modo estande</button>
    </div>
  );
}

const Present = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="13" rx="2" /><path d="M10 7.5v5l4.3-2.5z" fill="currentColor" stroke="none" /><path d="M8 21l4-4.5 4 4.5" strokeLinecap="round" /></svg>;

/** Botão flutuante (acima do WhatsApp) que abre a escolha da apresentação; some enquanto ela roda. */
function TourFab() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const out = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('pointerdown', out);
    addEventListener('keydown', esc);
    return () => { removeEventListener('pointerdown', out); removeEventListener('keydown', esc); };
  }, [open]);
  const pick = (m: TourMode) => { setOpen(false); startTour(m, true); };
  return (
    <div className={`tour-fab${open ? ' open' : ''}`} ref={box} data-tour-ui>
      {open && (
        <div className="tour-fab-menu" role="menu" aria-label="Apresentação automática">
          <p>Apresentação automática</p>
          <button type="button" role="menuitem" onClick={() => pick('loop')}>
            <i><Play /></i><span><b>Em loop</b><small>O site se apresenta sozinho</small></span>
          </button>
          <button type="button" role="menuitem" onClick={() => pick('estande')}>
            <i><Screen /></i><span><b>Modo estande</b><small>Tela cheia para TV de evento</small></span>
          </button>
        </div>
      )}
      <button type="button" className="tour-fab-btn" aria-label="Apresentação automática" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Present />
        <span className="tour-fab-tip" aria-hidden="true">Apresentação</span>
      </button>
    </div>
  );
}

/** Controles flutuantes da apresentação (pílula, aviso e tela de início do estande). */
export default function TourUI() {
  const t = useTour();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!t.resumeAt) return;
    const i = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(i);
  }, [t.resumeAt]);
  const secs = Math.max(0, Math.ceil((t.resumeAt - now) / 1000));
  const stand = t.mode === 'estande';

  return (
    <>
      {t.status === 'off' && <TourFab />}

      {t.status === 'arming' && (
        <div className="tour-arm" data-tour-ui role="dialog" aria-modal="true" aria-label="Modo estande">
          <div className="tour-arm-box">
            <BrandLogo variant="mono" />
            <h2>Modo estande</h2>
            <p>Apresentação automática do RF Group em tela cheia, em loop.</p>
            <button type="button" className="tour-go" onClick={() => startTour('estande', true)} autoFocus>
              <Screen />Iniciar em tela cheia
            </button>
            <small>Começa sozinho em {secs} s (sem tela cheia)</small>
            <button type="button" className="tour-link" onClick={stopTour}>Voltar ao site normal</button>
          </div>
        </div>
      )}

      {t.status === 'running' && !stand && (
        <div className="tour-pill" data-tour-ui role="status">
          <i aria-hidden="true" />
          <span>Apresentação em loop</span>
          <button type="button" className="ghost" onClick={pauseTour}>Pausar</button>
          <button type="button" className="ghost" onClick={() => startTour('estande', true)}>Modo estande</button>
          <button type="button" onClick={stopTour}>Sair</button>
        </div>
      )}

      {t.status === 'paused' && (
        <div className="tour-pill paused" data-tour-ui role="status">
          <span>{stand ? `Modo estande · a apresentação volta em ${secs} s` : 'Apresentação pausada'}</span>
          <button type="button" onClick={resumeTour}>{stand ? 'Retomar agora' : 'Retomar'}</button>
          {/* troca direta de modo, sem passar pelo rodapé */}
          <button type="button" className="ghost" onClick={() => startTour(stand ? 'loop' : 'estande', true)}>{stand ? 'Mudar para loop' : 'Modo estande'}</button>
          <button type="button" className="ghost" onClick={stopTour}>{stand ? 'Sair do modo estande' : 'Sair'}</button>
        </div>
      )}

      {t.toast && <div className="tour-toast" role="status" data-tour-ui>{t.toast}</div>}
    </>
  );
}

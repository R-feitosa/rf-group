import { LOGO_EITOSA, LOGO_GROUP, LOGO_MONO, LOGO_TRI, LOGO_VIEWBOX } from '../brandLogoPaths';

const WINE = '#5f0006';

/**
 * Logo oficial do RFEITOSA GROUP.
 *  - `color`: cores oficiais (para fundos claros);
 *  - `mono`: uma cor só (`currentColor`), para fundos escuros.
 */
export default function BrandLogo({ variant = 'color', className }: { variant?: 'color' | 'mono'; className?: string }) {
  const c = (color: string) => (variant === 'mono' ? 'currentColor' : color);
  return (
    <svg viewBox={LOGO_VIEWBOX} className={className} role="img" aria-label="RFEITOSA Group">
      {LOGO_TRI.map((t, i) => (
        <path key={i} d={t.d} fill={c(t.color)} opacity={variant === 'mono' ? [1, 0.55, 0.8][i] : 1} />
      ))}
      <path d={LOGO_MONO} fill={c(WINE)} fillRule="evenodd" />
      <path d={LOGO_EITOSA} fill={c(WINE)} />
      <rect x="258" y="103.5" width="197" height="2" fill={c(WINE)} />
      <path d={LOGO_GROUP} fill={c(WINE)} />
    </svg>
  );
}

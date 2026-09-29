import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useReveal } from '../hooks/useReveal';

type Props = {
  as?: ElementType;
  variant?: 'up' | 'left' | 'right';
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
};

const CLS = { up: 'rv', left: 'rv-l', right: 'rv-r' } as const;

export default function Reveal({ as: Tag = 'div', variant = 'up', className = '', ...rest }: Props) {
  const ref = useReveal<HTMLElement>();
  return <Tag ref={ref} className={`${CLS[variant]} ${className}`.trim()} {...rest} />;
}

export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} className="eyebrow" style={style}>{children}</div>;
}

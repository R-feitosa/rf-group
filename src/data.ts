import type { LogoKey } from './three/logos';
import type { Motion } from './three/Logo3D';

export type Stat = { value: number; label: string; prefix?: string; suffix?: string; decimals?: number };
export type Unit = {
  id: string;
  logo: LogoKey;
  motion: Motion;
  color: string;
  name: string;
  /** palavra-conceito da marca (material do Canva) */
  tagline: string;
  role: string;
  text: string;
  stats: Stat[];
  cta: { label: string; href: string };
  instagram: string;
};

export const WHATSAPP = '558888441638';
export const WHATSAPP_LABEL = '+55 88 8844-1638';
export const RH_EMAIL = 'rh@rfeitosa.com.br';
export const INSTAGRAM_GROUP = 'https://www.instagram.com/rfeitosagroup?igsh=MTM4ZWt0d2RsaXp5ag==';

export const UNITS: Unit[] = [
  {
    id: 'feitosa-advogados', logo: 'feitosa-advogados', motion: 'sway', color: '#5f0006',
    name: 'R.Feitosa Advogados', tagline: 'Obsessão', role: 'Núcleo jurídico',
    text: 'Unindo técnica e estratégia para transformar desafios legais em soluções inteligentes.',
    stats: [
      { value: 15, suffix: '+', label: 'anos de experiência' },
      { value: 5000, suffix: '+', label: 'casos de sucesso' },
      { value: 1.8, decimals: 1, prefix: 'R$ ', suffix: ' bi', label: 'em gestão patrimonial' },
    ],
    cta: { label: 'Visitar site', href: 'https://rfeitosa.com.br/' },
    instagram: 'https://www.instagram.com/rfeitosadvogados?igsh=cTdsOXh0MjEyc3J2',
  },
  {
    id: 'connect-valley', logo: 'connect-valley', motion: 'float', color: '#0a0e2b',
    name: 'Connect Valley', tagline: 'Despertar', role: 'Eventos e networking',
    text: 'Braço de eventos e networking do grupo, criando experiências empreendedoras que conectam pessoas, ideias e negócios.',
    stats: [
      { value: 800, suffix: '+', label: 'participantes' },
      { value: 80, suffix: '+', label: 'patrocinadores' },
    ],
    cta: { label: 'Visitar site', href: 'https://connect-valley.vercel.app/' },
    instagram: 'https://www.instagram.com/connect.valley?igsh=ZG1wbDRxNzByYnNj',
  },
  {
    id: 'connect-academy', logo: 'connect-academy', motion: 'sway', color: '#c9a227',
    name: 'Connect Academy', tagline: 'Provocar', role: 'Educação empresarial',
    text: 'Promove eventos que unem empresários para capacitação, levando conhecimento aplicado à gestão e ao crescimento dos negócios.',
    stats: [
      { value: 50, suffix: '+', label: 'cursos' },
      { value: 1000, suffix: '+', label: 'alunos' },
    ],
    cta: { label: 'Visitar site', href: 'https://connect-academy-rfgroup.vercel.app' },
    instagram: 'https://www.instagram.com/connect.valley?igsh=ZG1wbDRxNzByYnNj',
  },
  {
    id: 'eco-solucoes', logo: 'eco-solucoes', motion: 'float', color: '#737373',
    name: 'Eco Soluções', tagline: 'Lucratividade', role: 'Consultoria empresarial',
    text: 'Consultoria tributária, jurídica e empresarial com foco em performance e resultados sustentáveis.',
    stats: [
      { value: 100, suffix: '%', label: 'gestão positiva' },
      { value: 150, suffix: '+', label: 'empresas atendidas' },
    ],
    cta: { label: 'Conhecer', href: 'https://www.instagram.com/ecosolucoesemp?igsh=MW5lejV1dGU4N3ptOQ==' },
    instagram: 'https://www.instagram.com/ecosolucoesemp?igsh=MW5lejV1dGU4N3ptOQ==',
  },
  {
    id: 'feitosa-imoveis', logo: 'feitosa-imobiliarias', motion: 'sway', color: '#212965',
    name: 'Feitosa Imóveis', tagline: 'Servir', role: 'Locação e administração',
    text: 'Locação e administração de imóveis com atendimento humano, transparência e cuidado com o patrimônio.',
    stats: [
      { value: 15, suffix: '+', label: 'imóveis' },
      { value: 400, suffix: '+', label: 'hóspedes' },
    ],
    cta: { label: 'Conhecer', href: 'https://www.instagram.com/imoveis.feitosa?igsh=MXVzbGRtYXJxcDRzbQ==' },
    instagram: 'https://www.instagram.com/imoveis.feitosa?igsh=MXVzbGRtYXJxcDRzbQ==',
  },
];

export const PILLARS = [
  { title: 'Jurídico', text: 'Técnica e estratégia aplicadas a desafios legais.' },
  { title: 'Consultoria', text: 'Performance tributária, jurídica e empresarial.' },
  { title: 'Eventos & Educação', text: 'Networking e capacitação para empresários.' },
  { title: 'Imóveis', text: 'Locação e administração com atendimento humano.' },
];

export const NUMBERS: Stat[] = [
  { value: 15, suffix: '+', label: 'anos de experiência jurídica' },
  { value: 5000, suffix: '+', label: 'casos de sucesso' },
  { value: 150, suffix: '+', label: 'empresas atendidas' },
  { value: 800, suffix: '+', label: 'participantes em eventos' },
];

export const MARQUEE = ['Advocacia', 'Consultoria', 'Eventos', 'Educação', 'Imóveis', 'Compliance', 'Networking', 'Gestão', 'Estratégia'];

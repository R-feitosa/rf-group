// Folder da Feitosa Imóveis (resumo; o catálogo completo fica no site oficial) — base: catálogo oficial
// (rfeitosaimoveis.online, repositório R-feitosa/site-catalogo-feitosaimoveis). Imagens em src/assets/imoveis/.
export type Property = { id: string; name: string; place: string; tag: string; priceLabel: string; price: string };

export const IMOVEIS = {
  kicker: 'Portfólio 2026',
  title: ['Conheça nossos', 'imóveis'],
  lead: 'Casas por temporada, prédios residenciais e espaços comerciais em Sobral, Camocim e Meruoca. Estrutura completa, localização estratégica e atendimento direto.',
  numbers: [
    { v: '8', l: 'Imóveis' },
    { v: '3', l: 'Cidades' },
    { v: '3', l: 'Categorias' },
  ],
  categories: [
    {
      t: 'Temporada',
      items: [
        { id: 'varanda', name: 'Varanda Atlântica', place: 'Camocim — CE', tag: 'Beira-mar', priceLabel: 'Diária', price: 'R$ 500 — R$ 700' },
        { id: 'madeira', name: 'Casa de Madeira 700', place: 'Serra da Meruoca — CE', tag: 'Serra · 700 m', priceLabel: 'Diária', price: 'R$ 500 — R$ 600' },
      ],
    },
    {
      t: 'Residenciais',
      items: [
        { id: 'quantum', name: 'Quantum', place: 'Coração de Jesus — Sobral', tag: 'All-inclusive · Estudantes', priceLabel: 'Aluguel', price: 'R$ 500 — R$ 700' },
        { id: 'essencial', name: 'Essencial', place: 'Dom Expedito — Sobral', tag: 'Low cost', priceLabel: 'Aluguel', price: 'R$ 500 — R$ 600' },
        { id: 'alucinacao', name: 'Alucinação', place: 'Dom Expedito — Sobral', tag: 'Premium', priceLabel: 'Aluguel', price: 'R$ 750 — R$ 1.000' },
      ],
    },
    {
      t: 'Comerciais',
      items: [
        { id: 'auditorio', name: 'Auditório RF', place: 'Pedro Mendes Carneiro — Sobral', tag: 'Eventos · 80 lugares', priceLabel: 'Locação (4 h)', price: 'R$ 700 — R$ 800' },
        { id: 'connect', name: 'Connect Office', place: 'Centro — Sobral', tag: 'Coworking', priceLabel: 'Aluguel', price: 'R$ 800 — R$ 1.000' },
        { id: 'jebc', name: 'JEBC — Business Center', place: 'Bairro Coelce — Sobral', tag: 'Corporativo', priceLabel: 'Aluguel', price: 'R$ 1.700 — R$ 2.000' },
      ],
    },
  ] as { t: string; items: Property[] }[],
  priceNote: 'Valores “a partir de”, conforme o catálogo oficial; sujeitos a alteração.',
  links: {
    site: 'https://rfeitosaimoveis.online/',
    siteLabel: 'rfeitosaimoveis.online',
    whatsapp: '5588993280165',
    whatsappText: 'Olá! Vim pelo site do RF Group e gostaria de mais informações sobre os imóveis.',
    instagram: 'https://instagram.com/imoveis.feitosa',
  },
};

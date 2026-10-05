# RFEITOSA Group — Landing page

Landing page institucional do RFEITOSA Group em **React 18 + Vite + TypeScript**, com as logos 3D das empresas animadas em **three.js / React Three Fiber**.

## Rodar

```bash
npm install
npm run dev       # desenvolvimento (http://localhost:5173)
npm run build     # typecheck + build de produção em dist/
npm run preview   # serve o build
```

Deploy: projeto Vite padrão (a Vercel detecta automaticamente; saída em `dist/`).

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `src/components/BrandLogo.tsx` + `src/brandLogoPaths.ts` | Logo oficial RFEITOSA GROUP em SVG (colorida no header, branca no rodapé) |
| `src/data.ts` | Textos, números, links e cores de cada empresa; lista de clientes (`CLIENTS`) |
| `src/components/Clients.tsx` + `src/assets/clients/` | Carrossel "Empresas que confiam no grupo" (logos do site R.Feitosa Advogados, recortadas e em WebP) |
| `src/three/logos.json` | Vetores das logos (manual de marca, linha "Simplificação") |
| `src/three/logos.ts` | `buildLogo()` — gera o medalhão 3D de cada uma das 6 marcas |
| `src/three/Logo3D.tsx` + `sharedLogos.ts` | Logo 3D animada das seções e da landing; todas desenhadas por **um único** contexto WebGL compartilhado |
| `src/three/HeroScene.tsx` | Cena do hero: logo RF Group + 5 marcas em órbita (clicáveis) |
| `src/three/FlyLayer.tsx` + `flight.ts` | Transição de voo: a logo clicada no hero se expande na tela e pousa na seção da empresa |
| `src/landing/` (`AcademyLanding.tsx`, `academy.ts`, `controller.ts`) | Landing escondida da Connect Academy, montada a partir do **Folder 2026** (textos em `academy.ts`, imagens do folder em `src/assets/academy/`): mesma URL, abre ao clicar na logo da seção |
| `src/landing/ValleyLanding.tsx` + `valley.ts` | Folder escondido da **Connect Valley**: resumo do evento que sempre leva ao site oficial (connectvaley.com.br), sem substituí-lo; base: landing oficial (repositório `ConnectValley-Langing-Page`; imagens em `src/assets/valley/`) |
| `src/landing/ImoveisLanding.tsx` + `imoveis.ts` | Folder escondido da **Feitosa Imóveis**: portfólio resumido (temporada, residenciais, comerciais, valores "a partir de") que sempre leva ao catálogo oficial (rfeitosaimoveis.online), sem substituí-lo; base: repositório `site-catalogo-feitosaimoveis` (imagens em `src/assets/imoveis/`) |
| `src/landing/AdvogadosLanding.tsx` + `advogados.ts` | Folder escondido da **R.Feitosa Advogados**: áreas, sócios, números, reconhecimentos e unidades, sempre levando ao site oficial (site-sdvogados.vercel.app), sem substituí-lo; base: repositório `site-sdvogados` (imagens em `src/assets/advogados/`) |
| `src/three/explode.ts` | Explosão/remontagem 3D da logo (fragmentos + faíscas), adaptada de "Logos com explosão 3D" |
| `src/three/motion.ts` | Estado global de mouse/scroll compartilhado pelas cenas |
| `src/components/*` | Seções da página (Header, Hero, Quem somos, Empresas, Números, Contato, Footer) |

## Animações 3D

- **Entrada**: cada medalhão gira 1,5 volta e cresce com leve *overshoot* ao entrar na tela.
- **Idle**: `sway` (balança mostrando a face), `float` (flutua) ou `spin` (giro contínuo), com oscilação vertical.
- **Interação**: segue o mouse; inclina com a velocidade do scroll; ao passar o mouse dá um giro completo.
- **Hero**: as 5 marcas orbitam o medalhão RF Group, fazem *flip* periódico e mostram o nome no hover; o sistema inclina conforme a página rola.
- **Clique numa marca em órbita**: a logo sai da órbita, cresce girando no centro da tela (com véu desfocado ao fundo), a página rola sozinha e a logo voa até pousar exatamente no lugar da logo da empresa (~3,2 s, curvas suaves).
- **Landings escondidas (R.Feitosa Advogados, Connect Academy, Connect Valley e Feitosa Imóveis)**: clicar na logo da seção (ou em "Conhecer a Academy") faz a logo tremer e explodir em fragmentos com faíscas; a landing se abre em círculo a partir dela, com os fragmentos voando por cima. Fechar (botão, Esc ou "voltar" do navegador/celular) recolhe o círculo e remonta a logo no lugar. A URL não muda. Fragmentos e shaders são preparados em segundo plano; a landing fica montada (invisível) desde o carregamento.
- **Aparelhos fracos** (`src/three/device.ts`): economia de dados, pouca memória/núcleos, GPU por software ou tempo de quadro mediano do hero acima de 34 ms (< ~30 fps, ignorando travadas da abertura) → o voo é desligado e o clique só rola suavemente até a empresa; canvases em resolução 1×. Para testar: `?fx=lite` força o modo leve, `?fx=full` força o voo.
- **Limite de contextos WebGL**: o navegador limita quantos contextos 3D a página pode ter (≈8 no Chrome Android; passando disso ele derruba o mais antigo e o canvas fica branco). As logos das seções e da landing usam um renderizador compartilhado que desenha cada logo visível e copia para um `<canvas>` 2D — o site inteiro usa 4 contextos (topo, logos, voo, explosão).
- **Performance**: logos construídas uma vez e compartilhadas (cache); todos os canvases são montados e têm os shaders compilados em segundo plano logo após a abertura (`src/three/warm.ts`), então clique e rolagem nunca criam contexto WebGL nem compilam shader; canvases pausam fora da tela e, durante o voo, só a logo voadora e a de destino renderizam; sem filtros CSS sobre canvases.
- **Acessibilidade**: `prefers-reduced-motion` desliga as animações (o clique só rola até a empresa).

## Segurança

- **Cabeçalhos HTTP** (`vercel.json`): CSP restritiva (só recursos do próprio site; sem scripts de terceiros), `X-Frame-Options: DENY` e `frame-ancestors 'none'` (contra clickjacking), `nosniff`, `Referrer-Policy`, `Permissions-Policy` (câmera, microfone, geolocalização etc. desligados), HSTS e COOP.
- **Privacidade (LGPD)**: nenhuma requisição a terceiros ao abrir o site — fontes servidas localmente (`@fontsource`: Source Sans 3, Anton SC, Playfair Display, Outfit), sem Google Fonts, sem analytics; links do Instagram sem parâmetro de rastreio.
- **Formulário**: não grava nada; monta a mensagem e abre o WhatsApp. Campos com limite de tamanho e texto codificado com `encodeURIComponent`.
- **Dependências**: `npm audit` sem vulnerabilidades (produção e desenvolvimento). Rode `npm audit` periodicamente.

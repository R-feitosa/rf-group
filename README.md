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
| `src/data.ts` | Textos, números, links e cores de cada empresa (editar aqui) |
| `src/three/logos.json` | Vetores das logos (manual de marca, linha "Simplificação") |
| `src/three/logos.ts` | `buildLogo()` — gera o medalhão 3D de cada uma das 6 marcas |
| `src/three/Logo3D.tsx` | Componente de logo 3D animada usado nas seções das empresas |
| `src/three/HeroScene.tsx` | Cena do hero: logo RF Group + 5 marcas em órbita (clicáveis) |
| `src/three/FlyLayer.tsx` + `flight.ts` | Transição de voo: a logo clicada no hero se expande na tela e pousa na seção da empresa |
| `src/three/motion.ts` | Estado global de mouse/scroll compartilhado pelas cenas |
| `src/components/*` | Seções da página (Header, Hero, Quem somos, Empresas, Números, Contato, Footer) |

## Animações 3D

- **Entrada**: cada medalhão gira 1,5 volta e cresce com leve *overshoot* ao entrar na tela.
- **Idle**: `sway` (balança mostrando a face), `float` (flutua) ou `spin` (giro contínuo), com oscilação vertical.
- **Interação**: segue o mouse; inclina com a velocidade do scroll; ao passar o mouse dá um giro completo.
- **Hero**: as 5 marcas orbitam o medalhão RF Group, fazem *flip* periódico e mostram o nome no hover; o sistema inclina conforme a página rola.
- **Clique numa marca em órbita**: a logo sai da órbita, cresce girando no centro da tela (com véu desfocado ao fundo), a página rola sozinha e a logo voa até pousar exatamente no lugar da logo da empresa (~2,4 s).
- **Performance/acessibilidade**: os canvases só montam quando visíveis e pausam fora da tela; `prefers-reduced-motion` desliga as animações.

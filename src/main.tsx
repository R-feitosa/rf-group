import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// fonte servida pelo próprio site (sem requisição ao Google Fonts → não expõe IP do visitante a terceiros)
import '@fontsource-variable/source-sans-3';
import '@fontsource/anton-sc/latin.css'; // títulos da landing Connect Valley (mesma fonte do site oficial)
import '@fontsource/playfair-display/latin-600.css'; // títulos da landing Feitosa Imóveis (mesma fonte do catálogo oficial)
import '@fontsource/outfit/latin-300.css'; // títulos da landing R.Feitosa Advogados (mesma fonte do site oficial)
import '@fontsource/outfit/latin-600.css';
import '@fontsource/montserrat/latin-400.css'; // landing Eco Soluções (mesma família da marca)
import '@fontsource/montserrat/latin-700.css';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

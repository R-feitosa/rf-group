import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// fonte servida pelo próprio site (sem requisição ao Google Fonts → não expõe IP do visitante a terceiros)
import '@fontsource-variable/source-sans-3';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

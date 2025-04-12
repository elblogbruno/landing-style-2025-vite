import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client' 
// Importar configuración de i18n (debe ser antes que cualquier componente que use traducciones)
import './i18n';  
// Importar estilos en el orden correcto
import './app/section-styles.css';
import './app/custom.css';
 
import Portfolio from './app/page'  

createRoot(document.getElementById('root')!).render(
  <StrictMode> 
    <Portfolio />   
  </StrictMode>,
)

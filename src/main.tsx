import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client' 
// Importar estilos en el orden correcto
// import './app/globals.css';
import './app/section-styles.css';
import './app/custom.css';
 
import Portfolio from './app/page'  

createRoot(document.getElementById('root')!).render(
  <StrictMode> 
    {/* <UmamiAnalytics> */}
      <Portfolio /> 
    {/* </UmamiAnalytics> */}
  </StrictMode>,
)

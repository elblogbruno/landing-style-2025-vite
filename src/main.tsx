import { StrictMode } from 'react' 
import { createRoot, hydrateRoot } from 'react-dom/client' 
// Importar configuración de i18n (debe ser antes que cualquier componente que use traducciones)
import './i18n';  
// Importar estilos en el orden correcto
import './app/section-styles.css';
import './app/custom.css';
 
import Portfolio from './app/page.tsx'  
// import About from './app/sections/About/About';
// import Experience from './app/sections/Experience';

const container = document.getElementById('root')!;
const app = (
  <StrictMode> 
    <Portfolio />   
                  {/* <section id="about" className="section-container scroll-mt-16" data-section-id="about">
                    <Suspense fallback={null}>
                      <About theme={"dark"} /> 
                    </Suspense>
                  </section>
    
                  <section id="experience" className="section-container scroll-mt-16" data-section-id="experience">
                    <Suspense fallback={null}>
                      <Experience theme={"dark"} />
                    </Suspense>
                  </section> */}
  </StrictMode>
);
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);

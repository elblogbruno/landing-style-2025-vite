"use client";

import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
// import RevealJS from 'reveal.js';

import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/black.css';
// import './elevator-slides.css';

type SectionKey = 'hero' | 'about' | 'experience' | 'projects' | 'talks' | 'news' | 'education' | 'contact';

interface ElevatorSlidesProps {
  currentSection: SectionKey;
  theme: "dark" | "light";
  pitchLines: Record<SectionKey, string>;
}

const ElevatorSlides: React.FC<ElevatorSlidesProps> = ({ 
  currentSection,
  theme,
  pitchLines
}) => {
  const { t } = useTranslation();
  const slidesRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<Reveal.Api | null>(null);
  
  // Definición de plantillas de diapositivas para cada sección - moved inside component to use t()
  const sectionTemplates: Record<SectionKey, (theme: "dark" | "light", pitchLine: string) => JSX.Element> = {
    hero: (theme, pitchLine) => (
      <div className={`section-slide hero-slide ${theme}`}>
        <h2>{t('navigation.hero')}</h2>
        <div className="avatar-icon">👋</div>
        <p>{pitchLine}</p>
        <div className="instructions">{t('elevator.slides.navigate')}</div>
      </div>
    ),
    
    about: (theme, pitchLine) => (
      <div className={`section-slide about-slide ${theme}`}>
        <h2>{t('navigation.about')}</h2>
        <div className="content-columns">
          <div className="column">
            <ul className="skill-list">
              <li className="fragment fade-in">Full-stack Development</li>
              <li className="fragment fade-in">UI/UX Design</li>
              <li className="fragment fade-in">Problem Solving</li>
              <li className="fragment fade-in">Team Leadership</li>
            </ul>
          </div>
          <div className="column quote-column">
            <blockquote className="fragment fade-in">
              {pitchLine}
            </blockquote>
          </div>
        </div>
      </div>
    ),
    
    experience: (theme, pitchLine) => (
      <div className={`section-slide experience-slide ${theme}`}>
        <h2>{t('navigation.experience')}</h2>
        <div className="timeline">
          <div className="timeline-item fragment fade-in-then-semi-out">
            <div className="year">2023-Present</div>
            <div className="position">Lead Developer</div>
          </div>
          <div className="timeline-item fragment fade-in-then-semi-out">
            <div className="year">2020-2023</div>
            <div className="position">Senior Frontend Engineer</div>
          </div>
          <div className="timeline-item fragment fade-in-then-semi-out">
            <div className="year">2018-2020</div>
            <div className="position">Web Developer</div>
          </div>
        </div>
        <p className="pitch-quote fragment fade-in">{pitchLine}</p>
      </div>
    ),
    
    projects: (theme, pitchLine) => (
      <div className={`section-slide projects-slide ${theme}`}>
        <h2>{t('navigation.projects')}</h2>
        <div className="projects-grid">
          <div className="project-card fragment fade-in">
            <div className="project-icon">🚀</div>
            <div className="project-title">Project Alpha</div>
          </div>
          <div className="project-card fragment fade-in">
            <div className="project-icon">💡</div>
            <div className="project-title">Innovation Beta</div>
          </div>
          <div className="project-card fragment fade-in">
            <div className="project-icon">🔧</div>
            <div className="project-title">Tools Suite</div>
          </div>
          <div className="project-card fragment fade-in">
            <div className="project-icon">📱</div>
            <div className="project-title">Mobile App</div>
          </div>
        </div>
        <p className="fragment fade-in">{pitchLine}</p>
      </div>
    ),
    
    talks: (theme, pitchLine) => (
      <div className={`section-slide talks-slide ${theme}`}>
        <h2>{t('navigation.talks')}</h2>
        <ul className="talks-list">
          <li className="fragment fade-right">
            <span className="talk-date">2023</span>
            <span className="talk-title">Modern Web Architecture</span>
          </li>
          <li className="fragment fade-right">
            <span className="talk-date">2022</span>
            <span className="talk-title">UI Design Principles</span>
          </li>
          <li className="fragment fade-right">
            <span className="talk-date">2021</span>
            <span className="talk-title">Frontend Performance</span>
          </li>
        </ul>
        <p className="fragment fade-in">{pitchLine}</p>
      </div>
    ),
    
    news: (theme, pitchLine) => (
      <div className={`section-slide news-slide ${theme}`}>
        <h2>{t('navigation.news')}</h2>
        <div className="news-ticker">
          <div className="ticker-item fragment highlight-blue">New skill certification acquired</div>
          <div className="ticker-item fragment highlight-blue">Project successfully launched</div>
          <div className="ticker-item fragment highlight-blue">Industry award nomination</div>
        </div>
        <p className="fragment fade-in">{pitchLine}</p>
      </div>
    ),
    
    education: (theme, pitchLine) => (
      <div className={`section-slide education-slide ${theme}`}>
        <h2>{t('navigation.education')}</h2>
        <div className="education-card fragment fade-up">
          <div className="degree">Master's in Computer Science</div>
          <div className="school">Tech University</div>
          <div className="year">2015-2017</div>
        </div>
        <div className="education-card fragment fade-up">
          <div className="degree">Bachelor's in Software Engineering</div>
          <div className="school">Innovation College</div>
          <div className="year">2011-2015</div>
        </div>
        <p className="fragment fade-in">{pitchLine}</p>
      </div>
    ),
    
    contact: (theme, pitchLine) => (
      <div className={`section-slide contact-slide ${theme}`}>
        <h2>{t('navigation.contact')}</h2>
        <div className="contact-methods">
          <div className="contact-item fragment zoom-in">
            <div className="contact-icon">✉️</div>
            <div className="contact-label">Email</div>
          </div>
          <div className="contact-item fragment zoom-in">
            <div className="contact-icon">🌐</div>
            <div className="contact-label">Website</div>
          </div>
          <div className="contact-item fragment zoom-in">
            <div className="contact-icon">🔗</div>
            <div className="contact-label">LinkedIn</div>
          </div>
          <div className="contact-item fragment zoom-in">
            <div className="contact-icon">🐙</div>
            <div className="contact-label">GitHub</div>
          </div>
        </div>
        <p className="fragment fade-in">{pitchLine}</p>
      </div>
    )
  };
  
  // Inicializar RevealJS cuando el componente se monta
  useEffect(() => {
    // must happen when the page is definitely being rendered in a browser
    if (typeof window !== 'undefined') {
      if (slidesRef.current && !revealRef.current) {
        // Inicializar RevealJS con opciones optimizadas
        const revealOptions = { 
          embedded: true,
          controls: true,
          controlsLayout: 'bottom-right' as const,
          controlsBackArrows: 'visible' as const,
          progress: true,
          center: true,
          width: 1600,
          height: 600,
          margin: 0.1,
          minScale: 0.2,
          maxScale: 1.0,
          transition: 'fade' as const,
          transitionSpeed: 'fast' as const, // Transición más rápida
          backgroundTransition: 'fade' as const
        };
        
        // Importar dinámicamente RevealJS
        import('reveal.js').then((RevealModule) => {
          const Reveal = RevealModule.default;
          if (slidesRef.current) {
            revealRef.current = new Reveal(slidesRef.current as HTMLElement, revealOptions);
          }
          revealRef.current?.initialize();
        }).catch(err => {
          console.error("Error loading Reveal.js:", err);
        });
      }
    }
    
    // Limpiar al desmontar
    return () => {
      if (revealRef.current) {
        revealRef.current = null;
      }
    };
  }, []);
  
  // Actualizar presentación cuando cambia la sección
  useEffect(() => {
    if (revealRef.current) {
      // Restablecer la presentación a la primera diapositiva
      revealRef.current.slide(0, 0);
      
      // Forzar actualización de la presentación
      setTimeout(() => {
        revealRef.current?.sync();
      }, 100);
    }
  }, [currentSection]);

  return (
    <div className="elevator-slides-container" style={{ 
      width: '100%', 
      height: '100%', 
      overflow: 'hidden',
      backfaceVisibility: 'hidden',
      position: 'relative',
      zIndex: 10 // Asegurar un z-index adecuado
    }}>
      <div className="reveal" ref={slidesRef} style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        zIndex: 10,
        transformStyle: 'preserve-3d'
      }}>
        <div className="slides" style={{ 
          width: '100%', 
          height: '100%',
          backfaceVisibility: 'hidden',
          transformStyle: 'preserve-3d'
        }}>
          <section style={{ 
            width: '100%', 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformStyle: 'preserve-3d'
          }}> 
            {sectionTemplates[currentSection](theme, pitchLines[currentSection])}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ElevatorSlides;

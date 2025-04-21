"use client";

import React, { useMemo } from 'react';
import { BsGithub, BsLinkedin, BsInstagram, BsTwitter, BsEnvelope, BsFileEarmarkPerson } from "react-icons/bs"; 
import ToggleBtn from "./tglbutton";
import { useTranslation } from 'react-i18next';

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface FooterProps {
  setIsDarkMode: (value: boolean) => void;
  isDarkMode: boolean;
}

// Componente memoizado para los enlaces sociales
const SocialLinks = React.memo(({ 
  socialLinks, 
  email, 
  isDarkMode,
  t
}: { 
  socialLinks: SocialLink[], 
  email: string | null,
  isDarkMode: boolean,
  t: (key: string) => string
}) => {
  // Map social icon names to corresponding React icons - memoizado
  const getSocialIcon = (iconName: string): React.ElementType => {
    switch(iconName?.toLowerCase()) {
      case 'github': return BsGithub;
      case 'linkedin': return BsLinkedin;
      case 'twitter': return BsTwitter;
      case 'instagram': return BsInstagram;
      default: return BsEnvelope;
    }
  };
  
  // Componente individual para enlace social - mejor rendimiento que recrearlo en cada renderizado
  const SocialIcon = React.memo(({ 
    href, 
    icon: Icon, 
    label,
    className 
  }: { 
    href: string; 
    icon: React.ElementType; 
    label: string;
    className: string 
  }) => (
    <a 
      href={href} 
      className={className} 
      target="_blank" 
      rel="noopener noreferrer"
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </a>
  ));
  
  SocialIcon.displayName = 'SocialIcon';
  
  const iconClassName = `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors hover:scale-110`;

  return (
    <div className="flex items-center space-x-6">
      {/* Dynamically render social icons from translations */}
      {socialLinks.map((social) => (
        <SocialIcon 
          key={social.platform}
          href={social.url} 
          icon={getSocialIcon(social.icon)}
          label={`${t('footer.visit')} ${social.platform} ${t('footer.profile')}`}
          className={iconClassName} 
        />
      ))}
      
      {/* Add email icon if available */}
      {email && (
        <SocialIcon 
          href={`mailto:${email}`} 
          icon={BsEnvelope} 
          label={t('footer.sendEmail')}
          className={iconClassName} 
        />
      )}
    </div>
  );
});

SocialLinks.displayName = 'SocialLinks';

// Componente memoizado para la navegación
const Navigation = React.memo(({ 
  navigationSections, 
  linkClass 
}: { 
  navigationSections: Array<Array<{ name: string, href: string }>>,
  linkClass: string
}) => (
  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
    {navigationSections.map((column, colIndex) => (
      <div key={`col-${colIndex}`}>
        {column.map((section) => (
          <a 
            key={section.href} 
            href={section.href} 
            className={linkClass + " block mb-2"}
          >
            {section.name}
          </a>
        ))}
      </div>
    ))}
  </div>
));

Navigation.displayName = 'Navigation';

// Componente memoizado para contactos
const ContactInfo = React.memo(({ 
  email, 
  location, 
  resumeLink, 
  linkClass,
  isDarkMode,
  t
}: { 
  email: string | null,
  location: string | null,
  resumeLink: string | null,
  linkClass: string,
  isDarkMode: boolean,
  t: (key: string) => string
}) => (
  <nav className="flex flex-col space-y-2">
    {email && (
      <a href={`mailto:${email}`} className={`${linkClass} flex items-center gap-2 group`}>
        <BsEnvelope className="h-4 w-4 group-hover:text-indigo-500 transition-colors" />
        <span>{email}</span>
      </a>
    )}
    {location && (
      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
        {location}
      </p>
    )}
    {resumeLink && (
      <a 
        href={resumeLink} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`${linkClass} flex items-center gap-2 group`}
      >
        <BsFileEarmarkPerson className="h-4 w-4 group-hover:text-indigo-500 transition-colors" />
        <span>{t('footer.viewResume')}</span>
      </a>
    )}
  </nav>
));

ContactInfo.displayName = 'ContactInfo';

export const FooterComponent = React.memo(({ setIsDarkMode, isDarkMode }: FooterProps) => {
  const { t } = useTranslation();
  
  // Memoizar datos para evitar recreaciones en cada renderizado
  const contactData = useMemo(() => ({
    email: t('contact.email'),
    location: t('contact.location'),
    resume_link: t('contact.resume_link'),
    social: t('contact.social', { returnObjects: true }) as SocialLink[]
  }), [t]);
  
  const heroData = useMemo(() => ({
    title: t('hero.title'),
    subtitle: t('hero.subtitle')
  }), [t]);
  
  // Navigation sections based on the page structure - memoizado
  const navigationSections = useMemo(() => [
    [
      { name: t('navigation.hero'), href: "#hero" },
      { name: t('navigation.about'), href: "#about" },
      { name: t('navigation.experience'), href: "#experience" },
      { name: t('navigation.projects'), href: "#projects" },
    ],
    [
      { name: t('navigation.talks'), href: "#talks" },
      { name: t('navigation.news'), href: "#news" },
      { name: t('navigation.education'), href: "#education" },
      { name: t('navigation.contact'), href: "#contact" },
    ]
  ], [t]);

  // Memoizar clases CSS para evitar recreaciones de strings
  const linkClass = useMemo(() => `${isDarkMode 
    ? 'text-gray-400 hover:text-white' 
    : 'text-gray-600 hover:text-gray-900'} transition-colors hover:underline`, [isDarkMode]);

  // Extract name from hero title or use fallback - memoizado
  const heroName = useMemo(() => "Bruno Moya", []);

  const handleThemeChange = React.useCallback((value: boolean) => {
    setIsDarkMode(value);
    localStorage.setItem('theme', value ? 'dark' : 'light');
    localStorage.setItem('userThemePreference', 'true');
  }, [setIsDarkMode]);

  // Get social data from translations or use empty array as fallback
  const socialLinks = useMemo(() => contactData.social || [], [contactData.social]);
  
  // Memoizar parte superior del footer
  const footerTop = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 mb-8">
      {/* Column 1: About & Theme Toggle */}
      <div className="flex flex-col space-y-4">
        <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {heroData.title?.split(',')[0] || t('footer.portfolio')}
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {heroData.subtitle || t('footer.developerEntrepreneur')}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('footer.light')}</span>
          <ToggleBtn   
            className={`flex items-center justify-center w-10 h-5 rounded-full cursor-pointer transition-colors duration-200 ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
            onChange={handleThemeChange}
            checked={isDarkMode} 
          />
          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('footer.dark')}</span>
        </div>
      </div>
      
      {/* Column 2: Quick Links */}
      <div className="flex flex-col space-y-4">
        <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{t('footer.navigation')}</h3>
        <Navigation navigationSections={navigationSections} linkClass={linkClass} />
      </div>
      
      {/* Column 3: Contact */}
      <div className="flex flex-col space-y-4">
        <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{t('footer.contact')}</h3>
        <ContactInfo 
          email={contactData.email}
          location={contactData.location}
          resumeLink={contactData.resume_link}
          linkClass={linkClass}
          isDarkMode={isDarkMode}
          t={t}
        />
      </div>
    </div>
  ), [heroData.title, heroData.subtitle, isDarkMode, t, handleThemeChange, navigationSections, linkClass, contactData.email, contactData.location, contactData.resume_link]);
  
  // Memoizar el pie del footer
  const footerBottom = useMemo(() => (
    <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6">
      <div className="text-center md:text-left">
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
          © {new Date().getFullYear()} {heroName}. {t('footer.allRightsReserved')}
          <span className="hidden md:inline mx-2">•</span>
          <span className="block md:inline mt-1 md:mt-0">
            {t('footer.madeWithLove')}
          </span>
        </p>
      </div>
      
      <SocialLinks 
        socialLinks={socialLinks}
        email={contactData.email}
        isDarkMode={isDarkMode}
        t={t}
      />
    </div>
  ), [isDarkMode, heroName, t, socialLinks, contactData.email]);

  return (
    <footer className={`w-full transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} ${isDarkMode ? 'text-white' : 'text-gray-800'} mt-16 py-10 p-2`}>
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
        {footerTop}
        <hr className={`${isDarkMode ? 'border-gray-800' : 'border-gray-200'} my-6`} />
        {footerBottom}
      </div>
    </footer>
  );
});

FooterComponent.displayName = 'FooterComponent';

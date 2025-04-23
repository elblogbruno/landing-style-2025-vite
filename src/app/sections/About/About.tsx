import React from 'react';
import { TimelineAnimation } from './timeline';
import { useTranslation } from 'react-i18next';

interface AboutProps {
  theme?: "dark" | "light";
}

const About: React.FC<AboutProps> = ({ theme = "dark" }) => {
  const { t } = useTranslation();
  
  // Obtener los datos de timeline directamente desde las traducciones
  const timelineData = t('about.timeline', { returnObjects: true }) as {
    time: string;
    title: string;
    body: string;
    imgSrc: string;
    link?: string;
    btnText?: string;
    icon: React.ReactNode;
  }[];
  
  return (
    <TimelineAnimation timeline={timelineData} theme={theme} />
  );
};

export default About;

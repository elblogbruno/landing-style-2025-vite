import React from 'react';
import { TimelineAnimation } from '../components/timeline';

interface AboutProps {
  data: {
    title: string;
    paragraphs: string[];
    image: string;
    skills: string[];
    timeline: {
      time: string;
      title: string;
      body: string;
      imgSrc: string;
      link?: string;
      btnText?: string;
      icon: React.ReactNode; // Cambiar de string a ReactNode
    }[];
  };
  theme?: "dark" | "light";
}

const About: React.FC<AboutProps> = ({ data, theme = "dark" }) => {
  return (
    <TimelineAnimation timeline={data.timeline} theme={theme} />
  );
};

export default About;

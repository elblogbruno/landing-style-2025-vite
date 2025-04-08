// Tipo para las secciones
export type SectionKey = 'hero' | 'about' | 'experience' | 'projects' | 'talks' | 'news' | 'education' | 'contact';

// Tipo para la configuración de pisos
export type FloorConfig = {
  y: number;
  floor: number;
  description: string;
  pitchLine: string;
};

// Tipo para los colores basados en el tema
export type ThemeColors = {
  background: string;
  fogColor: string;
  walls: string;
  floor: string;
  railings: string;
  ceiling: string;
  highlight: string;
  metallic: string;
  metalTrim: string;
};

// import { initial } from 'lodash';
// import React from 'react';

// Common types for projects components
export interface Skill {
  name: string;
  // level: number; // 0-100
  category: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  skills: string[];
  githubUrl?: string | null;
  demoUrl?: string | null;
  featured: boolean;
  date: string;
  startDate?: string | null;
  endDate?: string | null;
  etsProject?: boolean; // Indica si el proyecto pertenece a la época en ÉTS Montreal
}

export interface ProjectsData {
  title: string;
  items: Project[];
  skills: Skill[];
  categories: Array<{ id: string; name: string }> | null;
}

export interface ProjectsProps {
  data?: ProjectsData; // Ahora es opcional porque usamos useTranslation
  theme?: 'dark' | 'light';
}

export interface ProjectCardProps {
  project: Project;
  theme: 'dark' | 'light';
  activeFilter: string | null;
  onSkillClick: (skill: string) => void;
}

export interface FeaturedProjectProps {
  project: Project;
  theme: 'dark' | 'light';
  // activeFilter: string | null;filterProjectsByCategory
  onSkillClick: (skill: string) => void;
}

export interface CategoryFilterProps {
  categories: Array<{ id: string; name: string }>;
  activeCategory: string;
  theme: 'dark' | 'light';
  onCategoryChange: (category: string) => void;
}

export interface SkillsFilterProps {
  skills: Array<{ name: string; category: string }>;
  categoryFilter: string;
  categories: Array<{ id: string; name: string }>;
  activeFilter: string | null;
  theme: 'dark' | 'light';
  onSkillClick: (skill: string) => void;  
}

export interface ActiveFilterBadgeProps {
  activeFilter: string;
  theme: 'dark' | 'light';
  onClearFilter: () => void;
}

export interface ProjectsListProps {
  featuredProjects: Project[];
  regularProjects: Project[];
  activeFilter: string | null;
  currentlyVisibleProjects: Project[];
  applySkillFilter: (skill: string) => void;
  theme: 'dark' | 'light'; 
}

export interface PaginationControlsProps {
  filteredProjects: Project[];
  initialProjectCount: number;
  allProjectsLoaded: boolean;
  expandedView: boolean;
  theme: 'dark' | 'light';
  onLoadMore: () => void;
  onCollapse: () => void;
}

export interface NoResultsMessageProps {
  theme: 'dark' | 'light';
  onClearFilter: () => void;
}

export interface ProjectStatsProps {
  count: number;
  allLoaded: boolean;
  expandedView: boolean;
  theme: 'dark' | 'light';
}

export interface FilterCategoryProps {
  categories: Array<{ id: string; name: string }>;
  activeCategory: string;
  theme: 'dark' | 'light';
  onCategoryChange: (category: string) => void;
}

export type CategoryMap = Record<string, string>;
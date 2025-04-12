import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ActiveFilterBadge from './projects/ActiveFilterBadge';
import FilterCategories from './projects/FilterCategories';
import NoResultsMessage from './projects/NoResultsMessage';
import PaginationControls from './projects/PaginationControls';
import ProjectsList from './projects/ProjectsList';
import SkillsFilter from './projects/SkillsFilter';
import { Project, ProjectsProps } from './projects/types';
import { filterProjectsByCategory, filterProjectsBySkill, sortProjects } from './projects/utils'; 
import ProjectStats from './projects/ProjectStats';

const Projects: React.FC<Omit<ProjectsProps, 'data'>> = React.memo(({ theme = 'dark' }) => {
  const { t } = useTranslation();
  const INITIAL_PROJECT_COUNT = 6;
  const LOAD_MORE_COUNT = 6;

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [visibleProjectCount, setVisibleProjectCount] = useState(INITIAL_PROJECT_COUNT);
  const [expandedView, setExpandedView] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [allProjectsLoaded, setAllProjectsLoaded] = useState(false);
  
  // Initialize showSkillsFilter based on window width - hide on mobile by default
  const [showSkillsFilter, setShowSkillsFilter] = useState(() => {
    // Check if window is available (client-side)
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768; // Show by default on tablet/desktop (md breakpoint)
    }
    return false; // Default to hidden on server-side rendering
  });

  // Obtener datos de proyectos desde las traducciones con conversiones de tipo explícitas
  const projectsData = useMemo(() => {
    return {
      title: t('projects.title'),
      categories: (t('projects.categories', { returnObjects: true }) as { id: string; name: string }[] || []),
      skills: (t('projects.skills', { returnObjects: true }) as { name: string; category: string }[] || []),
      items: (t('projects.items', { returnObjects: true }) as Project[] || [])
    };
  }, [t]);

  const sortedProjects = useMemo(() => sortProjects(projectsData.items), [projectsData.items]);
  
  // Get skills to use from the project's skills array if available, otherwise from general skills
  const projectSkills = useMemo(() => {
    // Asegurar que siempre devuelve un array
    return Array.isArray(projectsData.skills) ? projectsData.skills : [];
  }, [projectsData.skills]);
  
  // Use categories from site-data if available, or fall back to a default set
  const categories = useMemo(() => {
    // Always include 'all' category
    const allCategory = { id: 'all', name: t('projects.all') };
    
    // Check if categories are defined in the data
    if (Array.isArray(projectsData.categories) && projectsData.categories.length > 0) {
      return [allCategory, ...projectsData.categories];
    }
    
    // Extract unique categories from skills data as a optimization
    const uniqueCategories = new Set<string>();
    
    // Add categories from skills
    if (Array.isArray(projectSkills) && projectSkills.length > 0) {
      projectSkills.forEach(skill => {
        if (skill.category) {
          uniqueCategories.add(skill.category);
        }
      });
    }
    
    // Convert to the expected format
    const categoryItems = Array.from(uniqueCategories).map(category => ({
      id: category,
      name: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, '/')
    }));
    
    return [allCategory, ...categoryItems];
  }, [projectsData.categories, projectSkills, t]);

  // This function prioritizes featured projects - memoized to prevent recreation
  const getOptimizedProjectList = useCallback((projects: Project[]) => {
    // Separate featured and regular projects
    const featured = projects.filter(project => project.featured);
    const regular = projects.filter(project => !project.featured);
    
    // Return featured projects first, then regular projects
    return [...featured, ...regular];
  }, []);

  // Add effect to update showSkillsFilter state when window is resized - optimized with throttling
  useEffect(() => {
    let resizeTimer: number;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (window.innerWidth >= 768) {
          // On desktop/tablet, show skills filter by default unless explicitly hidden by user
          if (showSkillsFilter === false && !localStorage.getItem('skillsFilterHidden')) {
            setShowSkillsFilter(true);
          }
        } else {
          // On mobile, hide skills filter by default
          setShowSkillsFilter(false);
        }
      }, 150); // Throttle resize events
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Clean up
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [showSkillsFilter]);

  useEffect(() => {
    // Sort and prioritize featured projects
    const optimizedProjects = getOptimizedProjectList(sortedProjects);
    setFilteredProjects(optimizedProjects);
    setVisibleProjectCount(INITIAL_PROJECT_COUNT);
    setExpandedView(false);
    setAllProjectsLoaded(optimizedProjects.length <= INITIAL_PROJECT_COUNT);
  }, [sortedProjects, getOptimizedProjectList]);

  const handleCategoryChange = useCallback((category: string) => {
    setCategoryFilter(category);
    setActiveFilter(null);
    
    // Filter projects by category
    const filteredByCategory = filterProjectsByCategory(sortedProjects, category, Array.isArray(projectSkills) ? projectSkills : []);
    
    // Optimize the order to prioritize featured projects
    const optimizedProjects = getOptimizedProjectList(filteredByCategory);
    
    setFilteredProjects(optimizedProjects);
    setVisibleProjectCount(INITIAL_PROJECT_COUNT);
    setExpandedView(false);
    setAllProjectsLoaded(optimizedProjects.length <= INITIAL_PROJECT_COUNT);
    
    // Show skills filter when a category is selected (only on desktop by default)
    if (category !== 'all' && window.innerWidth >= 768) {
      setShowSkillsFilter(true);
    }
  }, [sortedProjects, projectSkills, getOptimizedProjectList]);

  const applySkillFilter = useCallback((skillName: string) => {
    setActiveFilter(skillName);
    
    // Filter projects by skill
    const filteredBySkill = filterProjectsBySkill(sortedProjects, skillName);
    
    // Optimize the order to prioritize featured projects
    const optimizedProjects = getOptimizedProjectList(filteredBySkill);
    
    setFilteredProjects(optimizedProjects);
    setVisibleProjectCount(INITIAL_PROJECT_COUNT);
    setExpandedView(false);
    setAllProjectsLoaded(optimizedProjects.length <= INITIAL_PROJECT_COUNT);
  }, [sortedProjects, getOptimizedProjectList]);

  const clearFilters = useCallback(() => {
    setActiveFilter(null);
    setCategoryFilter('all');
    
    // Reset to all projects with featured projects first
    const optimizedProjects = getOptimizedProjectList(sortedProjects);
    setFilteredProjects(optimizedProjects);
    
    setVisibleProjectCount(INITIAL_PROJECT_COUNT);
    setExpandedView(false);
    setAllProjectsLoaded(optimizedProjects.length <= INITIAL_PROJECT_COUNT);
  }, [sortedProjects, getOptimizedProjectList]);

  const loadMoreProjects = useCallback(() => {
    setVisibleProjectCount(prev => {
      const newCount = prev + LOAD_MORE_COUNT;
      setAllProjectsLoaded(newCount >= filteredProjects.length);
      return newCount;
    });
  }, [filteredProjects.length]);

  const collapseProjects = useCallback(() => {
    setVisibleProjectCount(INITIAL_PROJECT_COUNT);
    setExpandedView(false);
    setAllProjectsLoaded(false);
  }, [INITIAL_PROJECT_COUNT]);

  // Toggle skills filter visibility and remember preference
  const toggleSkillsFilter = useCallback(() => {
    setShowSkillsFilter(prevState => {
      const newState = !prevState;
      
      // Optionally, store user preference
      if (!newState) {
        localStorage.setItem('skillsFilterHidden', 'true');
      } else {
        localStorage.removeItem('skillsFilterHidden');
      }
      
      return newState;
    });
  }, []);

  const currentlyVisibleProjects = useMemo(() => {
    return filteredProjects.slice(0, visibleProjectCount);
  }, [filteredProjects, visibleProjectCount]);

  const featuredProjects = useMemo(() => {
    return currentlyVisibleProjects.filter(project => project.featured);
  }, [currentlyVisibleProjects]);

  const regularProjects = useMemo(() => {
    return currentlyVisibleProjects.filter(project => !project.featured);
  }, [currentlyVisibleProjects]);

  // Memoize component props to prevent recreating objects on each render
  const filterCategoriesProps = useMemo(() => ({
    categories,
    activeCategory: categoryFilter,
    onCategoryChange: handleCategoryChange,
    theme
  }), [categories, categoryFilter, handleCategoryChange, theme]);

  const skillsFilterProps = useMemo(() => ({
    skills: Array.isArray(projectSkills) ? projectSkills : [],
    categoryFilter,
    categories,
    activeFilter,
    onSkillClick: applySkillFilter,
    theme
  }), [projectSkills, categoryFilter, categories, activeFilter, applySkillFilter, theme]);

  const projectsListProps = useMemo(() => ({
    featuredProjects,
    regularProjects,
    activeFilter,
    currentlyVisibleProjects,
    applySkillFilter,
    theme
  }), [featuredProjects, regularProjects, activeFilter, currentlyVisibleProjects, applySkillFilter, theme]);

  const paginationControlsProps = useMemo(() => ({
    filteredProjects,
    initialProjectCount: visibleProjectCount,
    allProjectsLoaded,
    expandedView,
    onLoadMore: loadMoreProjects,
    onCollapse: collapseProjects,
    theme
  }), [filteredProjects, visibleProjectCount, allProjectsLoaded, expandedView, loadMoreProjects, collapseProjects, theme]);

  const projectStatsProps = useMemo(() => ({
    count: filteredProjects.length,
    allLoaded: allProjectsLoaded,
    expandedView,
    theme
  }), [filteredProjects.length, allProjectsLoaded, expandedView, theme]);

  return (
    <div className="md:py-16">
      <h2 className={`text-3xl font-bold mb-6 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{projectsData.title}</h2>

      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex-grow mr-4">
          <FilterCategories {...filterCategoriesProps} />
        </div>
        
        <button 
          onClick={toggleSkillsFilter}
          className={`px-4 py-2 mt-4 sm:mt-0 rounded-lg transition-all flex items-center ${
            theme === 'light'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
          }`}
        >
          {/* Add icon based on whether skills are showing */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {showSkillsFilter ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            )}
          </svg>
          {showSkillsFilter ? t('projects.hideSkills') : t('projects.showSkills')}
        </button>
      </div>

      {activeFilter && (
        <ActiveFilterBadge
          activeFilter={activeFilter}
          onClearFilter={clearFilters}
          theme={theme}
        />
      )}

      {showSkillsFilter && (
        <SkillsFilter {...skillsFilterProps} /> 
      )}

      <ProjectsList {...projectsListProps} />

      <PaginationControls {...paginationControlsProps} />

      {filteredProjects.length === 0 && (
        <NoResultsMessage
          onClearFilter={clearFilters}
          theme={theme}
        />
      )}

      <ProjectStats {...projectStatsProps} />
    </div>
  );
  
});

export default Projects;

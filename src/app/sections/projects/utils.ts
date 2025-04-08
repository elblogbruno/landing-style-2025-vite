import { Project, Skill } from "./types";

// Simplified filtering logic that uses skill categories directly from site data
export const filterProjectsByCategory = (projects: Project[], category: string, skills: Skill[]) => {
  if (category === 'all') {
    return projects;
  }
  
  // Create a map of skill names to their categories for quick lookup
  const skillCategoryMap = skills.reduce((map, skill) => {
    map[skill.name.toLowerCase()] = skill.category;
    return map;
  }, {} as Record<string, string>);
  
  return projects.filter(project => 
    project.skills.some(skill => {
      const skillLower = skill.toLowerCase();
      return skillCategoryMap[skillLower] === category;
    })
  );
};

export const filterProjectsBySkill = (projects: Project[], skillName: string) => {
  return projects.filter(project => 
    project.skills.some(skill => skill.toLowerCase() === skillName.toLowerCase())
  );
};

export const getSkillsForCategory = (skills: Skill[], category: string) => {
  if (category === 'all') {
    return skills;
  }
  
  return skills.filter(skill => skill.category === category);
};

export const sortProjects = (projects: Project[]) => {
  return projects.sort((a, b) => {
    // First, prioritize featured projects
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    // Then prioritize ongoing projects (no end date or endDate is null)
    const aIsOngoing = !a.endDate;
    const bIsOngoing = !b.endDate;
    
    if (aIsOngoing && !bIsOngoing) return -1;
    if (!aIsOngoing && bIsOngoing) return 1;
    
    // Finally sort by start date (most recent first)
    const dateA = new Date(a.startDate || a.date);
    const dateB = new Date(b.startDate || b.date);
    return dateB.getTime() - dateA.getTime();
  });
};
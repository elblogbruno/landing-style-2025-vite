import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface Skill {
  name: string;
  level: number; // 0-100
  category: 'frontend' | 'backend' | 'mobile' | 'other';
}

interface SkillsProps {
  data: {
    title: string;
    items: Skill[];
  };
  onSkillSelect?: (skill: string) => void;
}

const Skills: React.FC<SkillsProps> = ({ data, onSkillSelect }) => {
  const [filter, setFilter] = React.useState<'all' | 'frontend' | 'backend' | 'mobile' | 'other'>('all');
  const navigate = useNavigate();
  const location = useLocation();

  const filteredSkills = data.items.filter(skill => 
    filter === 'all' ? true : skill.category === filter
  );

  // Comprobar si hay un filtro de habilidad activo en la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const skillFilter = searchParams.get('skill');
    if (skillFilter) {
      // Si hay una habilidad en la URL, encontrar su categoría
      const skill = data.items.find(s => s.name.toLowerCase() === skillFilter.toLowerCase());
      if (skill) {
        setFilter(skill.category);
      }
    }
  }, [location.search, data.items]);

  const handleSkillClick = (skillName: string) => {
    if (onSkillSelect) {
      onSkillSelect(skillName);
    } else {
      // Si no se proporciona un manejador personalizado, navegar a los proyectos con esta habilidad
      const element = document.getElementById('projects');
      element?.scrollIntoView({ behavior: 'smooth' });

      // Actualizar la URL con el parámetro de búsqueda
      navigate(`?skill=${encodeURIComponent(skillName)}#projects`);
    }
  };

  return (
    <div className="md:py-16">
      <h2 className="text-3xl font-bold mb-8 text-white">{data.title}</h2>
      
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('frontend')}
          className={`px-4 py-2 rounded-full ${filter === 'frontend' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Frontend
        </button>
        <button 
          onClick={() => setFilter('backend')}
          className={`px-4 py-2 rounded-full ${filter === 'backend' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Backend
        </button>
        <button 
          onClick={() => setFilter('mobile')}
          className={`px-4 py-2 rounded-full ${filter === 'mobile' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Mobile
        </button>
        <button 
          onClick={() => setFilter('other')}
          className={`px-4 py-2 rounded-full ${filter === 'other' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          DevOps
        </button>
      </div>
      
      {/* Lista de habilidades - Ahora clickeables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredSkills.map(skill => (
          <div 
            key={skill.name} 
            className="mb-4 group cursor-pointer hover:bg-gray-800/30 p-3 rounded-lg transition-all"
            onClick={() => handleSkillClick(skill.name)}
          >
            <div className="flex justify-between mb-1">
              <span className="text-gray-300 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                {skill.name}
                <span className="text-xs text-gray-500 group-hover:text-gray-400">
                  (click to view projects)
                </span>
              </span>
              <span className="text-gray-400">{skill.level}%</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-300 group-hover:from-blue-400 group-hover:to-blue-300 transition-all" 
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Sección de etiquetas de habilidades para un acceso rápido */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-white mb-4">Quick Filter</h3>
        <div className="flex flex-wrap gap-2">
          {data.items.map(skill => (
            <div 
              key={skill.name}
              onClick={() => handleSkillClick(skill.name)}
              className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-sm cursor-pointer hover:bg-blue-500 hover:text-white transition-all"
            >
              {skill.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skills;

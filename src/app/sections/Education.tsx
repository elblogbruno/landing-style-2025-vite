import React from 'react';

interface EducationItem {
  id?: number;
  degree: string;
  institution: string;
  location?: string;
  period?: string;
  year?: string;
  description: string;
  image?: string; // Image property now holds the full path
}

interface EducationProps {
  data: {
    title: string;
    items: EducationItem[];
  };
  theme?: 'dark' | 'light';
}

const Education: React.FC<EducationProps> = ({ data, theme = 'dark' }) => {
  const isDark = theme === 'dark';
  
  return (
    <div className="md:py-16">
      <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>{data.title}</h2>
      
      <div className="relative">
        {/* Línea vertical */}
        <div className={`absolute left-0 md:left-1/2 transform md:-translate-x-1/2 top-0 h-full w-1 ${isDark ? 'bg-blue-500/30' : 'bg-blue-500/50'}`}></div>
        
        <div className="space-y-12">
          {data.items.map((item, index) => (
            <div key={item.id || index} className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              {/* Punto en la línea temporal */}
              <div className={`hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 border-4 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}></div>
              
              {/* Contenido en móvil */}
              <div className="md:hidden pl-8 relative mb-8">
                <div className={`absolute left-0 top-2 w-4 h-4 rounded-full bg-blue-500 border-4 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}></div>
                <div className={`p-6 rounded-lg shadow-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  {item.image && (
                    <div className="mb-4">
                      <img 
                        src={item.image} 
                        alt={item.institution} 
                        className="h-16 object-contain"
                        width="240"
                        height="64"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.degree}</h3>
                  <p className="text-blue-500 font-bold">{item.institution}</p>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                    {item.location ? `${item.location} | ` : ''}
                    {item.period || item.year}
                  </p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
                </div>
              </div>
              
              {/* Contenido en desktop */}
              <div className="hidden md:block w-1/2 px-10">
                <div className={`p-6 rounded-lg shadow-xl ${index % 2 === 0 ? 'mr-auto' : 'ml-auto'} ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  {item.image && (
                    <div className="mb-4">
                      <img 
                        src={item.image}  
                        alt={item.institution} 
                        className="h-16 object-contain"
                        width="240"
                        height="64"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{item.degree}</h3>
                  <p className="text-blue-500 font-bold">{item.institution}</p>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                    {item.location ? `${item.location} | ` : ''}
                    {item.period || item.year}
                  </p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
                </div>
              </div>
              
              {/* Fecha en desktop */}
              <div className="hidden md:flex w-1/2 items-center justify-center">
                <div className={`px-4 py-2 rounded-full text-sm font-bold ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                  {item.period || item.year}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Education;

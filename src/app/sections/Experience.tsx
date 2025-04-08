import React, { useState } from 'react';

interface ExperienceItem {
  logo: string;
  title: string;
  company: string;
  companyUrl: string;
  period: string;
  location: string;
  description?: string;
  moreInfo?: string;
}

interface ExperienceProps {
  data: {
    title: string;
    items: ExperienceItem[];
  };
  theme?: "dark" | "light";
}

const Experience: React.FC<ExperienceProps> = ({ data, theme = "dark" }) => {
  const [visibleItems, setVisibleItems] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceItem | null>(null);
  
  const showMore = () => {
    setVisibleItems(data.items.length);
  };

  const openModal = (experience: ExperienceItem) => {
    setSelectedExperience(experience);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExperience(null);
  };

  return (
    <div className="md:py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>{data.title}</h2>
        <div className="timeline space-y-6">
          {data.items.slice(0, visibleItems).map((experience, index) => (
            <div key={index} className="timeline-item">
              <div className={`flex flex-col sm:flex-row items-start gap-4 ${theme === "dark" ? "bg-black/20" : "bg-white/80 border border-gray-200"} p-4 sm:p-6 rounded-xl backdrop-blur-sm`}>
                <div className="relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 overflow-hidden rounded-lg mb-2 sm:mb-0">
                  <img 
                    src={experience.logo}
                    alt={`${experience.company} logo`}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="w-full min-w-0"> {/* min-w-0 prevents flex child from overflowing */}
                  <h3 className={`text-lg sm:text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"} break-words`}>{experience.title}</h3>
                  <h4 className="text-base sm:text-lg text-blue-400">
                    <a href={experience.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate inline-block max-w-full">
                      {experience.company}
                    </a>
                  </h4>
                  <div className={`flex flex-wrap items-center text-xs sm:text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"} mt-1`}>
                    <span className="inline-block mr-2">{experience.period}</span>
                    <span className="inline-block mx-1">•</span>
                    <span className="inline-block ml-1">{experience.location}</span>
                  </div>
                  {experience.description && (
                    <p className={`mt-2 sm:mt-3 text-sm sm:text-base ${theme === "dark" ? "text-gray-300" : "text-gray-600"} break-words`}>{experience.description}</p>
                  )}
                  {(experience.moreInfo || experience.description) && (
                    <div className="mt-3">
                      <button 
                        onClick={() => openModal(experience)}
                        className={`text-sm ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"} underline`}
                      >
                        See more details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {visibleItems < data.items.length && (
          <div className="text-center mt-6 sm:mt-8">
            <button 
              onClick={showMore}
              className={`px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base ${
                theme === "dark" 
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500" 
                  : "bg-blue-500/20 text-blue-700 border border-blue-300"
              } rounded-md hover:bg-blue-600/50 transition-colors duration-300`}
            >
              Show more
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedExperience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div 
            className={`relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl ${
              theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"
            } p-6 shadow-xl`}
          >
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-2xl font-bold"
              aria-label="Cerrar"
            >
              &times;
            </button>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="relative flex-shrink-0 w-16 h-16 overflow-hidden rounded-lg">
                <img 
                  src={selectedExperience.logo}
                  alt={`${selectedExperience.company} logo`}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                  {selectedExperience.title}
                </h3>
                <h4 className="text-lg text-blue-400">
                  <a href={selectedExperience.companyUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {selectedExperience.company}
                  </a>
                </h4>
                <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  {selectedExperience.period} • {selectedExperience.location}
                </div>
              </div>
            </div>
            
            {selectedExperience.description && (
              <div className="mb-4">
                <h5 className={`text-lg font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"} mb-2`}>
                  Descripción
                </h5>
                <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  {selectedExperience.description}
                </p>
              </div>
            )}
            
            {selectedExperience.moreInfo && (
              <div>
                <h5 className={`text-lg font-semibold ${theme === "dark" ? "text-gray-200" : "text-gray-700"} mb-2`}>
                  Más información
                </h5>
                <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  {selectedExperience.moreInfo}
                </p>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <button 
                onClick={closeModal}
                className={`px-4 py-2 ${
                  theme === "dark" 
                    ? "bg-blue-600 text-white" 
                    : "bg-blue-500 text-white"
                } rounded-md hover:bg-blue-700 transition-colors duration-300`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Experience;

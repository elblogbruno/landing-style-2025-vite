import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Award {
  id: number;
  title: string;
  organization: string;
  date: string;
  category: string;
  description: string;
  image?: string;
  url?: string;
  featured?: boolean;
  badgeColor?: string;
  imageStyle?: string; // Changed from 'contain' | 'cover' | undefined to string to accept any string value
  type: 'award' | 'certificate' | 'publication' | 'recognition' | string; // Changed to allow any string values
}

interface AwardsProps {
  theme?: 'dark' | 'light';
}

const Awards: React.FC<AwardsProps> = ({ theme = 'dark' }) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 }); // Cambiar a once: true y reducir amount
  const controls = useAnimation();

  // Obtener datos desde las traducciones
  const awardsData = {
    title: t('awards.title'),
    subtitle: t('awards.subtitle'),
    description: t('awards.description'),
    items: t('awards.items', { returnObjects: true }) as Award[],
    contactText: t('awards.contactText'),
  };

  // Group by item type (award, certificate, publication)
  const itemsByType = awardsData.items.reduce((acc, item) => {
    const type = item.type || 'award'; // Default to 'award' if not specified
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {} as Record<string, Award[]>);

  // Get featured awards
  const featuredAwards = awardsData.items.filter((award) => award.featured);

  // Get non-featured awards
  const nonFeaturedAwards = awardsData.items.filter((award) => !award.featured);

  useEffect(() => {
    // Activar animación inmediatamente si está en vista
    if (isInView) {
      controls.start('visible');
    }

    // Forzar animación después de 1 segundo en caso de que useInView falle
    const timer = setTimeout(() => {
      controls.start('visible');
    }, 1000);

    return () => clearTimeout(timer);
  }, [isInView, controls]);

  const handleAwardClick = (award: Award) => {
    setSelectedAward(award);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Helper function to get badge color class
  const getBadgeColorClass = (color?: string): string => {
    const colorMap: Record<string, string> = {
      blue: isDark
        ? 'bg-blue-900/70 text-blue-300 border-blue-700'
        : 'bg-blue-100 text-blue-700 border-blue-300',
      green: isDark
        ? 'bg-green-900/70 text-green-300 border-green-700'
        : 'bg-green-100 text-green-700 border-green-300',
      red: isDark
        ? 'bg-red-900/70 text-red-300 border-red-700'
        : 'bg-red-100 text-red-700 border-red-300',
      yellow: isDark
        ? 'bg-yellow-900/70 text-yellow-300 border-yellow-700'
        : 'bg-yellow-100 text-yellow-700 border-yellow-300',
      purple: isDark
        ? 'bg-purple-900/70 text-purple-300 border-purple-700'
        : 'bg-purple-100 text-purple-700 border-purple-300',
      indigo: isDark
        ? 'bg-indigo-900/70 text-indigo-300 border-indigo-700'
        : 'bg-indigo-100 text-indigo-700 border-indigo-300',
      orange: isDark
        ? 'bg-orange-900/70 text-orange-300 border-orange-700'
        : 'bg-orange-100 text-orange-700 border-orange-300',
    };

    return (
      colorMap[color || 'blue'] ||
      (isDark
        ? 'bg-gray-800 text-gray-300 border-gray-700'
        : 'bg-gray-100 text-gray-700 border-gray-200')
    );
  };

  // Helper function to determine if image needs special display properties
  const getImageProperties = (award: Award) => {
    // Default properties
    const props = {
      objectFit: 'object-cover',
      height: 'h-40',
      bgColor: '',
    };

    // Check if the award has explicitly defined imageStyle
    if (award.imageStyle === 'contain') {
      props.objectFit = 'object-contain';
      props.height = 'h-48'; // Give more height for contain mode
      props.bgColor = isDark ? 'bg-gray-800' : 'bg-gray-100';
    }
    // Special case for known awards that need contain mode (fallback for existing data)
    else if (award.title === 'Maker of Merit') {
      props.objectFit = 'object-contain';
      props.height = 'h-48';
      props.bgColor = isDark ? 'bg-gray-800' : 'bg-gray-100';
    }

    return props;
  };

  // Helper function to get appropriate icon for item type
  const getItemTypeIcon = (item: Award) => {
    const type = item.type || 'award';

    if (type === 'publication') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      );
    } else if (type === 'certificate') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    } else if (type === 'recognition') {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 0v4m0-4h4m-4 0H8m6-6a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    } else {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      );
    }
  };

  return (
    <div className="py-10" ref={containerRef}>
      {/* Section header with 3D effect */}
      <div className="mb-12 text-center">
        <motion.h2
          className={`text-4xl font-bold mb-4 relative inline-block ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}
          initial={{ opacity: 0.5, y: 20 }} // Aumentar opacidad inicial
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
        >
          <span className="relative z-10">{awardsData.title}</span>
          <span
            className={`absolute -bottom-1.5 left-0 w-full h-3 ${
              isDark ? 'bg-blue-600/30' : 'bg-blue-200'
            } transform -rotate-1 z-0`}
            style={{ borderRadius: '2px' }}
          ></span>
        </motion.h2>

        <motion.h3
          className={`text-xl font-medium mb-4 ${
            isDark ? 'text-blue-400' : 'text-blue-700'
          }`}
          initial={{ opacity: 0.5, y: 20 }} // Aumentar opacidad inicial
          animate={controls}
          variants={{
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, delay: 0.1 },
            },
          }}
        >
          {awardsData.subtitle}
        </motion.h3>

        <motion.p
          className={`max-w-3xl mx-auto ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}
          initial={{ opacity: 0.5, y: 20 }} // Aumentar opacidad inicial
          animate={controls}
          variants={{
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, delay: 0.2 },
            },
          }}
        >
          {awardsData.description}
        </motion.p>
      </div>

      {/* Featured awards section - 3D card style display */}
      {featuredAwards.length > 0 && (
        <motion.div
          className="mb-16"
          initial={{ opacity: 0.5, y: 20 }} // Aumentar opacidad inicial
          animate={controls}
          variants={{
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.7, delay: 0.2 },
            },
          }}
        >
          <h3
            className={`text-xl font-semibold mb-6 ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}
          >
            {t('awards.featuredAchievements')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredAwards.map((award, index) => {
              const imgProps = getImageProperties(award);

              return (
                <motion.div
                  key={award.id}
                  className={`relative group rounded-xl p-6 shadow-lg border cursor-pointer transform transition-all duration-500 hover:-translate-y-2 perspective-1000 ${
                    isDark
                      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700'
                      : 'bg-white border-gray-200'
                  }`}
                  onClick={() => handleAwardClick(award)}
                  whileHover={{
                    scale: 1.02,
                    rotateY: 5,
                    boxShadow: isDark
                      ? '0 10px 30px -10px rgba(0,0,255,0.3)'
                      : '0 10px 30px -10px rgba(0,0,0,0.2)',
                  }}
                  initial={{ opacity: 0.5, y: 20 }} // Aumentar opacidad inicial
                  animate={controls}
                  variants={{
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.6,
                        delay: 0.2 + index * 0.05, // Reducir delay y multiplicador
                      },
                    },
                  }}
                >
                  {/* Shiny accent element */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                    style={{
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s infinite linear',
                    }}
                  ></div>

                  {/* Top part with image */}
                  <div className="mb-4">
                    <div
                      className={`relative ${imgProps.height} overflow-hidden rounded-lg mb-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 ${imgProps.bgColor}`}
                    >
                      {award.image ? (
                        <img
                          src={award.image}
                          alt={award.title}
                          className={`w-full h-full ${imgProps.objectFit} transform group-hover:scale-105 transition-transform duration-500`}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div
                            className={`w-16 h-16 ${getBadgeColorClass(
                              award.badgeColor
                            )} rounded-full flex items-center justify-center`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-8 w-8"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                              />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Badge for category */}
                      <div
                        className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full border ${getBadgeColorClass(
                          award.badgeColor
                        )}`}
                      >
                        {award.category}
                      </div>

                      {/* Type indicator badge if it's not an award */}
                      {award.type && award.type !== 'award' && (
                        <div
                          className={`absolute top-2 left-2 px-2 py-1 text-xs rounded-full flex items-center
                          ${
                            isDark
                              ? 'bg-gray-800/80 text-white border-gray-700'
                              : 'bg-white/80 text-gray-800 border-gray-200'
                          } border`}
                        >
                          {getItemTypeIcon(award)}
                          {award.type === 'publication'
                            ? t('awards.typesPublication')
                            : award.type === 'certificate'
                            ? t('awards.typesCertificate')
                            : award.type === 'recognition'
                            ? t('awards.typesRecognition')
                            : ''}
                        </div>
                      )}
                    </div>

                    <h4
                      className={`text-xl font-bold group-hover:text-blue-400 transition-colors ${
                        isDark ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {award.title}
                    </h4>

                    <p
                      className={`mt-1 text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {award.organization} • {award.date}
                    </p>
                  </div>

                  {/* Description */}
                  <p
                    className={`text-sm line-clamp-3 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {award.description}
                  </p>

                  {/* Read more indicator */}
                  <div
                    className={`mt-4 text-sm font-medium ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    } group-hover:underline`}
                  >
                    {t('awards.viewDetails')}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Display sections by type - Publications, Awards, Certificates */}
      {['publication', 'award', 'certificate', 'recognition'].map((type) => {
        const items = itemsByType[type] || [];
        if (items.length === 0) return null;

        return (
          <motion.div
            key={type}
            className="mb-16"
            initial={{ opacity: 0.5, y: 20 }} // Aumentar opacidad inicial
            animate={controls}
            variants={{
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, delay: 0.3 },
              },
            }}
          >
            <h3
              className={`text-xl font-semibold mb-6 flex items-center ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}
            >
              {type === 'publication' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              )}
              {type === 'certificate' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {type === 'award' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              )}
              {type === 'recognition' && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="8" strokeWidth={2} />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 7l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5z"
                  />
                </svg>
              )}

              {type === 'publication'
                ? t('awards.typesPublications')
                : type === 'certificate'
                ? t('awards.typesCertifications')
                : type === 'recognition'
                ? t('awards.typesRecognitions')
                : t('awards.typesAwards')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items
                .filter(
                  (item) =>
                    !item.featured ||
                    (item.featured && nonFeaturedAwards.length === 0)
                )
                .map((item, index) => {
                  const imgProps = getImageProperties(item);

                  return (
                    <motion.div
                      key={item.id}
                      className={`rounded-lg border cursor-pointer transform transition-all duration-300 hover:-translate-y-1 ${
                        isDark
                          ? 'bg-gray-800 border-gray-700 hover:border-blue-700'
                          : 'bg-white border-gray-200 hover:border-blue-400'
                      }`}
                      onClick={() => handleAwardClick(item)}
                      whileHover={{ scale: 1.03 }}
                      initial={{ opacity: 0.5, y: 20 }} // Aumentar opacidad inicial
                      animate={controls}
                      variants={{
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: {
                            duration: 0.4,
                            delay: 0.3 + index * 0.03, // Reducir delay y multiplicador
                          },
                        },
                      }}
                    >
                      {/* Card with consistent height */}
                      <div className="h-full flex flex-col">
                        {/* Item image if available */}
                        {item.image && (
                          <div
                            className={`${imgProps.height} overflow-hidden rounded-t-lg ${imgProps.bgColor}`}
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className={`w-full h-full ${imgProps.objectFit}`}
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        )}

                        {/* Item content */}
                        <div className="p-4 flex-1 flex flex-col">
                          {/* Category badge */}
                          <div className="flex justify-between items-center mb-2">
                            <div
                              className={`px-2 py-0.5 text-xs rounded-full ${getBadgeColorClass(
                                item.badgeColor
                              )}`}
                            >
                              {item.category}
                            </div>
                          </div>

                          <h4
                            className={`text-base font-semibold mb-1 ${
                              isDark ? 'text-white' : 'text-gray-800'
                            }`}
                          >
                            {item.title}
                          </h4>

                          <p
                            className={`text-xs mb-2 ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {item.organization} • {item.date}
                          </p>

                          <p
                            className={`text-xs line-clamp-2 mb-3 flex-1 ${
                              isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            {item.description}
                          </p>

                          <div
                            className={`text-xs font-medium ${
                              isDark ? 'text-blue-400' : 'text-blue-600'
                            } mt-auto flex items-center`}
                          >
                            {type === 'publication'
                              ? t('awards.readPublication')
                              : type === 'recognition'
                              ? t('awards.seeRecognition')
                              : t('awards.viewDetails')}{' '}
                            →
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        );
      })}

      {/* Contact prompt */}
      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0.5, y: 20 }} // Aumentar opacidad inicial
        animate={controls}
        variants={{
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, delay: 0.4 }, // Reducir delay
          },
        }}
      >
        <p
          className={`${
            isDark ? 'text-gray-400' : 'text-gray-500'
          } italic`}
        >
          {awardsData.contactText}{' '}
          <a
            href="#contact"
            className={`${
              isDark
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-blue-600 hover:text-blue-500'
            } underline`}
          >
            {t('awards.contactMe')}
          </a>
        </p>
      </motion.div>

      {/* Modal for award details */}
      {isModalOpen && selectedAward && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div
            className={`relative w-full max-w-2xl rounded-xl overflow-hidden ${
              isDark
                ? 'bg-gray-900 border border-gray-700'
                : 'bg-white border border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            {/* Close button */}
            <button
              className={`absolute top-4 right-4 z-10 p-2 rounded-full ${
                isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={closeModal}
              title="Close modal"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Item image */}
            {selectedAward && (
              <>
                {/* Use the same image properties helper function for the modal */}
                {(() => {
                  const imgProps = getImageProperties(selectedAward);
                  // Use taller height for modal
                  const modalHeight =
                    imgProps.objectFit === 'object-contain'
                      ? 'h-80'
                      : 'h-64';

                  return (
                    <div
                      className={`relative ${modalHeight} overflow-hidden ${imgProps.bgColor}`}
                    >
                      {selectedAward.image ? (
                        <img
                          src={selectedAward.image}
                          alt={selectedAward.title}
                          className={`w-full h-full ${imgProps.objectFit}`}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-r ${
                            isDark
                              ? 'from-blue-900 to-indigo-900'
                              : 'from-blue-100 to-indigo-100'
                          } flex items-center justify-center`}
                        >
                          <div
                            className={`w-24 h-24 ${getBadgeColorClass(
                              selectedAward.badgeColor
                            )} rounded-full flex items-center justify-center`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-12 w-12"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                              />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Category badge */}
                      <div
                        className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm ${getBadgeColorClass(
                          selectedAward.badgeColor
                        )}`}
                      >
                        {selectedAward.category}
                      </div>

                      {/* Type indicator if it's not an award */}
                      {selectedAward.type && selectedAward.type !== 'award' && (
                        <div
                          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm flex items-center
                          ${
                            isDark
                              ? 'bg-gray-800 text-white border-gray-700'
                              : 'bg-white text-gray-800 border-gray-200'
                          } border`}
                        >
                          {getItemTypeIcon(selectedAward)}
                          <span>
                            {selectedAward.type === 'publication'
                              ? t('awards.typesPublication')
                              : selectedAward.type === 'certificate'
                              ? t('awards.typesCertificate')
                              : selectedAward.type === 'recognition'
                              ? t('awards.typesRecognition')
                              : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}

            {/* Award details */}
            <div className="p-6">
              <h3
                className={`text-2xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}
              >
                {selectedAward.title}
              </h3>

              <p
                className={`mb-4 ${
                  isDark ? 'text-blue-400' : 'text-blue-700'
                }`}
              >
                {selectedAward.organization} • {selectedAward.date}
              </p>

              <div
                className={`prose ${
                  isDark ? 'prose-invert' : ''
                } max-w-none mb-6`}
              >
                <p
                  className={isDark ? 'text-gray-300' : 'text-gray-700'}
                >
                  {selectedAward.description}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                {selectedAward.url && (
                  <a
                    href={selectedAward.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                      isDark
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    {selectedAward.type === 'publication'
                      ? t('awards.readPublication')
                      : selectedAward.type === 'certificate'
                      ? t('awards.viewCertificate')
                      : selectedAward.type === 'recognition'
                      ? t('awards.seeRecognition')
                      : t('awards.viewDetails')}
                  </a>
                )}

                <button
                  onClick={closeModal}
                  className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  {t('awards.close')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add custom CSS for animations */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        
        .hide-scrollbar::-webkit-scrollbar-track {
          background: ${isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.5)'};
          border-radius: 3px;
        }
        
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? 'rgba(56, 189, 248, 0.5)' : 'rgba(59, 130, 246, 0.5)'};
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default Awards;
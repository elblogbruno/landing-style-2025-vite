import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface BuildingItem {
  id: string;
  name: string;
  role: string;
  body: string;
  quote?: string;
  points: string[];
  links: { label: string; href: string }[];
}

interface WhatImBuildingProps {
  theme?: 'dark' | 'light';
}

// "Qué estoy construyendo": Glassear, TopBrokers y experimentos
const WhatImBuilding: React.FC<WhatImBuildingProps> = ({ theme = 'dark' }) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const rawItems = t('building.items', { returnObjects: true, defaultValue: [] }) as BuildingItem[];
  const items = Array.isArray(rawItems) ? rawItems : [];

  const cardStyle = isDark
    ? 'bg-zinc-900/70 border-zinc-800/80 backdrop-blur-md shadow-xl text-zinc-100'
    : 'bg-white/85 border-zinc-200/90 backdrop-blur-md shadow-lg shadow-zinc-900/5 text-zinc-800';

  return (
    <section id="building" aria-labelledby="building-title" className="w-full max-w-full px-4 sm:px-6 py-6 sm:py-10 scroll-mt-20">
      <div className={`mb-6 sm:mb-8 rounded-2xl border p-5 sm:p-6 min-w-0 max-w-full ${cardStyle}`}>
        <span className="text-xs font-mono font-semibold tracking-wider uppercase text-blue-500 mb-1.5 block">
          {t('building.eyebrow')}
        </span>
        <h2 id="building-title" className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight break-words ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          {t('building.title')}
        </h2>
      </div>

      {/* Glassear ocupa el ancho completo: es la apuesta larga que explica el resto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 min-w-0 max-w-full">
        {items.map((item, index) => (
          <article key={item.id} className={`rounded-2xl border p-5 sm:p-6 flex flex-col min-w-0 max-w-full overflow-hidden ${index === 0 ? 'md:col-span-2' : ''} ${cardStyle}`}>
            <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {item.name}
            </h3>
            <p className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.role}</p>

            <p className={`mt-4 text-base leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              {item.body}
            </p>

            {item.quote && (
              <p className="mt-4 text-base font-semibold leading-relaxed">{item.quote}</p>
            )}

            {item.points.length > 0 && <ul className={`mt-4 space-y-2 ${index === 0 ? 'md:grid md:grid-cols-3 md:gap-4 md:space-y-0' : ''}`}>
              {item.points.map((point) => (
                <li key={point} className={`flex gap-2 text-sm leading-snug ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>}

            <div className="mt-auto pt-5 flex flex-wrap gap-2">
              {item.links.map((link) => {
                const external = link.href.startsWith('http');
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      isDark
                        ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {link.label}
                    <span aria-hidden="true">{external ? '↗' : '→'}</span>
                  </a>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default memo(WhatImBuilding);

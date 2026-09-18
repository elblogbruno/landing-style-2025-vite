import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface Principle {
  title: string;
  body: string;
}

interface HowIThinkProps {
  theme?: 'dark' | 'light';
}

// Principios cortos: el criterio que sale de construir productos
const HowIThink: React.FC<HowIThinkProps> = ({ theme = 'dark' }) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const rawItems = t('principles.items', { returnObjects: true, defaultValue: [] }) as Principle[];
  const items = Array.isArray(rawItems) ? rawItems : [];

  return (
    <section id="how-i-think" aria-labelledby="how-i-think-title" className="w-full max-w-full px-4 sm:px-6 pt-4 pb-8 sm:pb-12 scroll-mt-20">
      <span className="text-xs font-mono font-semibold tracking-wider uppercase text-amber-500 mb-1.5 block">
        {t('principles.eyebrow')}
      </span>
      <h2 id="how-i-think-title" className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 break-words ${isDark ? 'text-white' : 'text-zinc-900'}`}>
        {t('principles.title')}
      </h2>

      <ol className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 min-w-0 max-w-full">
        {items.map((item, index) => (
          <li
            key={item.title}
            className={`rounded-2xl border p-5 sm:p-6 backdrop-blur-md min-w-0 max-w-full overflow-hidden ${
              isDark ? 'bg-zinc-900/70 border-zinc-800/80' : 'bg-white/85 border-zinc-200/90 shadow-sm'
            }`}
          >
            <span className="text-xs font-mono font-bold text-amber-500" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className={`mt-1 text-lg sm:text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {item.title}
            </h3>
            <p className={`mt-2 text-base leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {item.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default memo(HowIThink);

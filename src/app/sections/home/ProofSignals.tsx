import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface Signal {
  value: string;
  label: string;
  href?: string;
}

interface ProofSignalsProps {
  theme?: 'dark' | 'light';
}

// Fila corta de hechos verificables justo debajo del hero
const ProofSignals: React.FC<ProofSignalsProps> = ({ theme = 'dark' }) => {
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const rawItems = t('signals.items', { returnObjects: true, defaultValue: [] }) as Signal[];
  const items = Array.isArray(rawItems) ? rawItems : [];

  const cardStyle = isDark
    ? 'bg-zinc-900/70 border-zinc-800/80 hover:border-blue-500/50'
    : 'bg-white/85 border-zinc-200/90 hover:border-blue-400 shadow-sm';

  return (
    <section aria-label={t('signals.label', 'Evidence')} className="w-full max-w-full px-4 sm:px-6 pb-6 md:pb-10">
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0 max-w-full">
        {items.map((item) => (
          <li key={item.value} className="min-w-0">
            <a
              href={item.href}
              className={`block h-full rounded-2xl border backdrop-blur-md p-3 sm:p-5 transition-colors min-w-0 overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 ${cardStyle}`}
            >
              <span className={`block text-base sm:text-xl font-extrabold tracking-tight break-words ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {item.value}
              </span>
              <span className={`block mt-2 text-sm leading-relaxed break-words ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default memo(ProofSignals);

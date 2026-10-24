import { renderToString } from 'react-dom/server';
import i18n from './i18n';
import Portfolio from './app/page';
import { loadAllFloors } from './app/components/floors';

export async function render(language: string) {
  await i18n.changeLanguage(language);
  // Every floor's code has to be in memory before renderToString, which cannot wait for a
  // Suspense boundary: an unloaded floor would be prerendered as its loading placeholder.
  await loadAllFloors();
  return renderToString(<Portfolio />);
}

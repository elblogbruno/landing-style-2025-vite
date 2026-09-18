import { renderToString } from 'react-dom/server';
import i18n from './i18n';
import Portfolio from './app/page';

export async function render(language: string) {
  await i18n.changeLanguage(language);
  return renderToString(<Portfolio />);
}

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import './hero.css';

const Hero = memo(({ data, theme }: {
  data: { profileImage: string }; theme: 'light' | 'dark';
}) => {
  const { t } = useTranslation();
  return (
    <section className={`hero-intro hero-welcome hero-welcome--${theme}`}>
      <div className="hero-lobby__entrance">
        <div>
          <p className="hero-lobby__plaque">{t('hero.badge')}</p>
          <p className="hero-lobby__invitation">{t('hero.buildingWelcome')}</p>
        </div>
        <svg className="hero-lobby__doors" viewBox="0 0 80 100" fill="none" aria-hidden="true">
          <rect x="3" y="2" width="74" height="96" rx="2" fill="currentColor" opacity=".12" />
          <rect x="24" y="7" width="32" height="15" rx="2" fill="#17253b" />
          <path d="M32 17v-5h4v5h-4Zm11 0v-5h4v5h-4Z" stroke="#99c7ff" />
          <path d="M9 95V27h62v68M40 27v68" stroke="currentColor" strokeWidth="3" />
          <path d="M13 31h23v60H13zM44 31h23v60H44z" fill="#77add3" opacity=".25" />
          <path d="m14 56 20-20m12 20 19-19" stroke="currentColor" opacity=".25" />
          <path d="M33 60v14m14-14v14M5 96h70" stroke="currentColor" strokeWidth="3" />
        </svg>
      </div>
      <div className="hero-welcome__content">
      <div className="hero-welcome__identity">
        <img src={data.profileImage} alt="Bruno Moya" width="112" height="112"
          loading="eager" decoding="async" {...{ fetchpriority: 'high' }} />
        <div>
          <p className="hero-welcome__name">Bruno Moya</p>
          <p className="hero-welcome__location">{t('hero.location')}</p>
        </div>
        <span className="hero-welcome__floor" aria-hidden="true">00</span>
      </div>
      <h1>{t('hero.title')}<span>{t('hero.titleAccent')}</span></h1>
      <p className="hero-welcome__roles">{t('hero.subtitle')}</p>
      <a className="hero-welcome__speaker" href="#talks">{t('hero.speaker')} <span aria-hidden="true">↗</span></a>
      <p className="hero-welcome__story">{t('hero.description')}</p>
      <div className="hero-welcome__actions">
        <a className="hero-welcome__primary" href="#building">{t('hero.primaryCta')} <span aria-hidden="true">↗</span></a>
        <a className="hero-welcome__secondary" href="#experience">{t('hero.experienceCta')} <span aria-hidden="true">→</span></a>
      </div>
      </div>
      <p className="hero-lobby__wayfinding"><span aria-hidden="true">↓</span><span>{t("hero.buildingHint")}</span></p>
    </section>
  );
});
export default Hero;

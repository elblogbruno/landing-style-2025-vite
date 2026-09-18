import React from 'react';
import { useTranslation } from 'react-i18next';
import { getFloorDisplayCode } from '../../utils/elevator-altitude';
import { getCurrentAge } from '../../../utils/age-calculator';
import './museum.css';

interface TimelineItem {
  time: string;
  era?: string;
  title: string;
  body: string;
  imgSrc?: string | string[];
  imageCaption?: string;
  imageCaptionLink?: string;
  imageCaptionLinkText?: string;
  link?: string;
  btnText?: string;
}

const About: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme = 'dark' }) => {
  const { t } = useTranslation();
  const rawTimeline = t('about.timeline', { returnObjects: true, defaultValue: [] }) as TimelineItem[];
  const timeline = Array.isArray(rawTimeline) ? rawTimeline : [];

  return (
    <section className={`story-museum story-museum--${theme}`} aria-labelledby="story-museum-title">
      <header className="story-museum__entrance">
        <p className="story-museum__room">
          {t('elevator.floor')} {getFloorDisplayCode('about')} <span aria-hidden="true"> / </span> {t('about.museumLabel')}
        </p>
        <h2 id="story-museum-title">{t('about.title')}</h2>
        <p className="story-museum__introduction">{t('about.museumIntro')}</p>
        <div className="story-museum__details">
          <span>{t('about.currentAge', { count: getCurrentAge() })}</span>
          <span>{t('about.exhibitCount', { count: timeline.length })}</span>
        </div>
      </header>

      <ol className="story-museum__collection">
        {timeline.map((item, index) => {
          const images = (Array.isArray(item.imgSrc) ? item.imgSrc : [item.imgSrc]).filter(Boolean) as string[];
          return (
            <li className="story-museum__stop" key={item.time + item.title}>
              <div className="story-museum__year">
                <span className="story-museum__dot" aria-hidden="true" />
                <span>{item.time}</span>
              </div>
              <article className="story-museum__exhibit">
                {images.length > 0 && (
                  <figure className="story-museum__piece">
                    <div className="story-museum__spotlight" aria-hidden="true" />
                    <div className={`story-museum__frames ${images.length > 1 ? 'story-museum__frames--pair' : ''}`}>
                      {images.map((src, imageIndex) => (
                        <div key={src} className="story-museum__frame">
                          <img src={src}
                            alt={images.length > 1 ? `${item.title} (${imageIndex + 1}/${images.length})` : item.title}
                            loading="lazy" decoding="async" width="640" height="480" />
                        </div>
                      ))}
                    </div>
                    {item.imageCaption && (
                      <figcaption>
                        <span>{item.imageCaption}</span>
                        {item.imageCaptionLink && (
                          <a href={item.imageCaptionLink} target="_blank" rel="noopener noreferrer">
                            {item.imageCaptionLinkText || new URL(item.imageCaptionLink).hostname} <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </figcaption>
                    )}
                  </figure>
                )}
                <div className="story-museum__label">
                  <p className="story-museum__catalogue">
                    {t('about.exhibitLabel', { number: String(index + 1).padStart(2, '0') })}
                    {item.era && <span> · {item.era}</span>}
                  </p>
                  <h3>{item.title}</h3>
                  <p className="story-museum__body">{item.body}</p>
                  {item.link && (
                    <a className="story-museum__source" href={item.link} target="_blank" rel="noopener noreferrer">
                      {item.btnText || item.title} <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ol>
      <p className="story-museum__continuation">{t('about.museumContinuation')}</p>
    </section>
  );
};

export default About;

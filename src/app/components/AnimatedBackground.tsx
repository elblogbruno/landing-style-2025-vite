"use client";
import { memo, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { FLOOR_METRICS } from '../utils/elevator-altitude';
import type { SectionKey } from './avatar/types';
import './exterior-background.css';

interface AnimatedBackgroundProps {
  theme: 'light' | 'dark';
  currentSection?: SectionKey;
  onLoad?: () => void;
}

// Fixed architecture keeps the same city in view when changing floor or theme.
const BUILDINGS = [
  [0, 9, 64], [8, 7, 43], [16, 11, 78], [28, 8, 51],
  [37, 10, 69], [47, 8, 47], [57, 12, 88], [70, 7, 58],
  [78, 11, 73], [90, 10, 48],
];

interface VehicleConfig {
  id: string;
  type: 'sedan' | 'taxi' | 'van' | 'sports' | 'compact';
  direction: 'west' | 'east';
  color: string;
  accent?: string;
  duration: number;
  delay: number;
}

const VEHICLES: VehicleConfig[] = [
  // Westbound lane (top lane, traveling left)
  { id: 'w1', type: 'sedan', direction: 'west', color: '#2563eb', accent: '#1d4ed8', duration: 16, delay: -3 },
  { id: 'w2', type: 'van', direction: 'west', color: '#f8fafc', accent: '#f97316', duration: 22, delay: -11 },
  { id: 'w3', type: 'sedan', direction: 'west', color: '#64748b', accent: '#475569', duration: 18, delay: -15 },
  // Eastbound lane (bottom lane, traveling right)
  { id: 'e1', type: 'taxi', direction: 'east', color: '#f59e0b', accent: '#d97706', duration: 17, delay: -7 },
  { id: 'e2', type: 'sports', direction: 'east', color: '#ef4444', accent: '#dc2626', duration: 13, delay: -1 },
  { id: 'e3', type: 'compact', direction: 'east', color: '#10b981', accent: '#059669', duration: 19, delay: -14 },
];

const renderVehicle = (v: VehicleConfig) => {
  const isVan = v.type === 'van';
  const isCompact = v.type === 'compact';
  const isSports = v.type === 'sports';
  const isTaxi = v.type === 'taxi';
  const width = isVan ? 85 : isCompact ? 68 : 75;
  const frontX = isVan ? 33 : isCompact ? 23 : 27;

  return (
    <svg
      key={v.id}
      className={`exterior__car exterior__car--${v.direction}`}
      style={{
        width: `${width}px`,
        height: '14px',
        animationDuration: `${v.duration}s`,
        animationDelay: `${v.delay}s`,
      }}
      viewBox={`0 0 ${width} 14`}
      aria-hidden="true"
    >
      {/* Headlight beam */}
      {isVan ? (
        <polygon points="34,3 82,0 82,14 34,11" fill="url(#exterior-beam-grad)" className="exterior__car-beam" />
      ) : isCompact ? (
        <polygon points="24,3 66,0 66,14 24,11" fill="url(#exterior-beam-grad)" className="exterior__car-beam" />
      ) : (
        <polygon points="28,3 72,0 72,14 28,11" fill="url(#exterior-beam-grad)" className="exterior__car-beam" />
      )}

      {/* Tires */}
      <rect x="3" y="1" width={isVan ? 6 : 5} height="2" rx="1" fill="#0f172a" />
      <rect x="3" y="11" width={isVan ? 6 : 5} height="2" rx="1" fill="#0f172a" />
      <rect x={isVan ? 25 : isCompact ? 17 : 20} y="1" width={isVan ? 6 : 5} height="2" rx="1" fill="#0f172a" />
      <rect x={isVan ? 25 : isCompact ? 17 : 20} y="11" width={isVan ? 6 : 5} height="2" rx="1" fill="#0f172a" />

      {/* Chassis & Body */}
      {isSports ? (
        <path d="M2 4 Q2 2 4 2 L22 2 Q27 2 28 5 L28 9 Q27 12 22 12 L4 12 Q2 12 2 10 Z" fill={v.color} />
      ) : (
        <rect x="2" y="2" width={isVan ? 32 : isCompact ? 22 : 26} height="10" rx={isVan ? 2 : 3} fill={v.color} />
      )}

      {/* Cargo / Van Accent Panel */}
      {isVan && v.accent && (
        <rect x="4" y="3" width="16" height="8" rx="1" fill={v.accent} />
      )}

      {/* Windows & Cabin Roof */}
      {isSports ? (
        <>
          <path d="M7 3.5 L6 4.5 Q5 7 6 9.5 L7 10.5 Z" fill="#0f172a" opacity="0.8" />
          <rect x="8" y="3.5" width="9" height="7" fill={v.accent} rx="1" />
          <path d="M18 3.5 L21 4.5 Q22 7 21 9.5 L18 10.5 Z" fill="#0f172a" opacity="0.8" />
        </>
      ) : isCompact ? (
        <>
          <rect x="5" y="3.5" width="3" height="7" rx="0.5" fill="#0f172a" opacity="0.75" />
          <rect x="9" y="3.5" width="6" height="7" fill={v.accent} rx="0.5" />
          <rect x="16" y="3.5" width="3" height="7" rx="0.5" fill="#0f172a" opacity="0.8" />
        </>
      ) : isVan ? (
        <rect x="23" y="3.5" width="4" height="7" rx="0.5" fill="#0f172a" opacity="0.8" />
      ) : (
        <>
          <rect x="6" y="3.5" width="3" height="7" rx="0.5" fill="#0f172a" opacity="0.75" />
          <rect x="10" y="3.5" width="8" height="7" fill={v.accent} rx="0.5" />
          {isTaxi && (
            <rect x="12" y="4.5" width="4" height="5" rx="1" fill="#ffffff" className="exterior__car-beacon" />
          )}
          <rect x="19" y="3.5" width="3.5" height="7" rx="0.5" fill="#0f172a" opacity="0.75" />
        </>
      )}

      {/* Taillights */}
      <rect x="1" y="2.5" width="1.5" height="2" rx="0.5" fill="#f87171" className="exterior__car-taillight" />
      <rect x="1" y="9.5" width="1.5" height="2" rx="0.5" fill="#f87171" className="exterior__car-taillight" />

      {/* Headlights */}
      <rect x={frontX} y="2.5" width="1.5" height="2" rx="0.5" fill="#fffde7" className="exterior__car-headlight" />
      <rect x={frontX} y="9.5" width="1.5" height="2" rx="0.5" fill="#fffde7" className="exterior__car-headlight" />
    </svg>
  );
};

interface PlaneConfig {
  id: string;
  type: 'airliner' | 'regional';
  direction: 'east' | 'west';
  top: string;
  duration: number;
  delay: number;
  tailColor: string;
}

const PLANES: PlaneConfig[] = [
  // High altitude airliner flying East
  { id: 'p1', type: 'airliner', direction: 'east', top: '8%', duration: 38, delay: -12, tailColor: '#2563eb' },
  // Medium altitude jet flying West
  { id: 'p2', type: 'regional', direction: 'west', top: '16%', duration: 46, delay: -28, tailColor: '#e11d48' },
];

const renderPlane = (p: PlaneConfig) => {
  const isAirliner = p.type === 'airliner';
  const width = isAirliner ? 180 : 140;
  const height = isAirliner ? 24 : 20;

  return (
    <div
      key={p.id}
      className={`exterior__plane exterior__plane--${p.direction}`}
      style={{
        top: p.top,
        animationDuration: `${p.duration}s`,
        animationDelay: `${p.delay}s`,
      }}
      aria-hidden="true"
    >
      {isAirliner ? (
        <svg width={width} height={height} viewBox="0 0 180 24" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`contrail-${p.id}`} x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="12" width="128" height="2.2" rx="1" fill={`url(#contrail-${p.id})`} className="exterior__plane-contrail" />
          <g transform="translate(128, 0)">
            <path d="M2 13 Q20 13 42 13 Q48 13 50 11 L50 13 Q46 16 38 16 L12 16 Q5 16 2 13 Z" fill="#94a3b8" opacity="0.35" />
            <path d="M2 12 Q5 9 14 9 L44 9 Q50 9 52 12 Q50 15 44 15 L14 15 Q5 15 2 12 Z" fill="#f8fafc" />
            <path d="M47 10.5 Q49.5 11 50 12 L47 12 Z" fill="#1e293b" />
            <circle cx="20" cy="11.5" r="0.75" fill="#334155" />
            <circle cx="24" cy="11.5" r="0.75" fill="#334155" />
            <circle cx="28" cy="11.5" r="0.75" fill="#334155" />
            <circle cx="32" cy="11.5" r="0.75" fill="#334155" />
            <circle cx="36" cy="11.5" r="0.75" fill="#334155" />
            <circle cx="40" cy="11.5" r="0.75" fill="#334155" />
            <path d="M4 10 L10 2 L15 2 L12 10 Z" fill={p.tailColor} />
            <rect x="27" y="15" width="8" height="3" rx="1.5" fill="#64748b" />
            <path d="M24 13 L36 13 L30 19 L25 19 Z" fill="#cbd5e1" />
            <circle cx="10" cy="2" r="1.5" fill="#ffffff" className="exterior__plane-beacon" />
            <circle cx="25" cy="19" r="1.2" fill="#ef4444" className="exterior__plane-nav-red" />
          </g>
        </svg>
      ) : (
        <svg width={width} height={height} viewBox="0 0 140 20" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id={`contrail-${p.id}`} x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="10" width="98" height="1.8" rx="0.9" fill={`url(#contrail-${p.id})`} className="exterior__plane-contrail" />
          <g transform="translate(98, 0)">
            <path d="M2 10 Q16 10 32 10 Q38 10 40 8.5 L40 10 Q37 13 30 13 L10 13 Q4 13 2 10 Z" fill="#94a3b8" opacity="0.35" />
            <path d="M2 9.5 Q4 7 11 7 L34 7 Q39 7 41 9.5 Q39 12 34 12 L11 12 Q4 12 2 9.5 Z" fill="#f8fafc" />
            <path d="M37 8 Q39 8.5 40 9.5 L37 9.5 Z" fill="#1e293b" />
            <circle cx="16" cy="9.5" r="0.65" fill="#334155" />
            <circle cx="20" cy="9.5" r="0.65" fill="#334155" />
            <circle cx="24" cy="9.5" r="0.65" fill="#334155" />
            <circle cx="28" cy="9.5" r="0.65" fill="#334155" />
            <path d="M3 8 L8 1.5 L12 1.5 L10 8 Z" fill={p.tailColor} />
            <rect x="21" y="12" width="6.5" height="2.5" rx="1.2" fill="#64748b" />
            <path d="M19 10 L28 10 L24 15 L20 15 Z" fill="#cbd5e1" />
            <circle cx="8" cy="1.5" r="1.3" fill="#ffffff" className="exterior__plane-beacon" />
            <circle cx="20" cy="15" r="1.1" fill="#22c55e" className="exterior__plane-nav-green" />
          </g>
        </svg>
      )}
    </div>
  );
};

const AnimatedBackground = ({
  theme,
  currentSection = 'hero',
  onLoad,
}: AnimatedBackgroundProps) => {
  const [visibleSection, setVisibleSection] = useState<string>(currentSection);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = Array.from(document.querySelectorAll<HTMLElement>('main > section[data-section-id]'))
        .reverse().find(el => el.getBoundingClientRect().top <= window.innerHeight * 0.35);
      setVisibleSection(section?.id ?? 'hero');
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    const main = document.querySelector('main');
    if (main) resize.observe(main);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  const altitude = FLOOR_METRICS[visibleSection]?.altitudeMeters ?? 0;
  // The city drops out of view as the visitor climbs from the lobby.
  const ground = 86 + altitude * 1.65;

  useEffect(() => { onLoad?.(); }, [onLoad]);

  return (
    <div
      className="exterior"
      data-theme={theme}
      data-floor={visibleSection}
      aria-hidden="true"
      style={{
        '--ground': `${ground}vh`,
        '--altitude-shift': `${altitude * 1.65}vh`,
        '--distant-shift': `${altitude * 0.35}vh`
      } as CSSProperties}
    >
      <div className="exterior__stars" />
      <div className="exterior__sun" />
      <div className="exterior__cloud exterior__cloud--one" />
      <div className="exterior__cloud exterior__cloud--two" />
      <div className="exterior__planes">{PLANES.map(renderPlane)}</div>
      <div className="exterior__distance">
        <svg className="exterior__hills" viewBox="0 0 1600 300" preserveAspectRatio="none">
          <path d="M0 190 Q90 140 170 165 T340 130 T510 170 Q610 80 720 125 T910 95 Q1000 35 1090 95 T1270 140 T1450 120 L1600 165 V300 H0Z" />
          <path d="M0 225 Q140 155 290 200 T540 175 T810 210 Q950 135 1110 180 T1380 160 L1600 210 V300 H0Z" />
        </svg>
        <div className="exterior__skyline" />
      </div>
      <div className="exterior__world">
        <div className="exterior__buildings">
          {BUILDINGS.map(([left, width, height], index) => (
            <div
              key={left}
              className={`exterior__building exterior__building--${index % 3}`}
              style={{ left: `${left}%`, width: `${width}%`, height: `${height}vh` }}
            >
              <div className="exterior__windows" />
            </div>
          ))}
        </div>
        <div className="exterior__haze" />
        <div className="exterior__trees"><i /><i /><i /><i /><i /></div>
        <div className="exterior__street">
          <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
            <defs>
              <linearGradient id="exterior-beam-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fffde7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#fffde7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          {VEHICLES.map(renderVehicle)}
        </div>
        <div className="exterior__soil" />
        <div className="exterior__pipe" />
      </div>
      <div className="exterior__vignette" />
    </div>
  );
};

export default memo(AnimatedBackground);

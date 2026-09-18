export interface FloorMetric {
  floorNumber: number;
  displayCode: string;
  altitude: string;
  altitudeMeters: number;
}

export const FLOOR_METRICS: Record<string, FloorMetric> = {
  hero: { floorNumber: 0, displayCode: '00', altitude: '±0.0m', altitudeMeters: 0 },
  about: { floorNumber: 1, displayCode: '01', altitude: '+5.5m', altitudeMeters: 5.5 },
  experience: { floorNumber: 2, displayCode: '02', altitude: '+14.0m', altitudeMeters: 14 },
  projects: { floorNumber: 3, displayCode: '03', altitude: '+23.5m', altitudeMeters: 23.5 },
  talks: { floorNumber: 4, displayCode: '04', altitude: '+33.0m', altitudeMeters: 33 },
  news: { floorNumber: 4, displayCode: '04', altitude: '+33.0m', altitudeMeters: 33 },
  awards: { floorNumber: 5, displayCode: '05', altitude: '+42.5m', altitudeMeters: 42.5 },
  education: { floorNumber: 6, displayCode: '06', altitude: '+52.0m', altitudeMeters: 52 },
  contact: { floorNumber: 7, displayCode: '07', altitude: '+61.5m', altitudeMeters: 61.5 },
};

export const getFloorAltitude = (section: string): string => {
  return FLOOR_METRICS[section]?.altitude || '±0.0m';
};

export const getFloorDisplayCode = (section: string): string => {
  return FLOOR_METRICS[section]?.displayCode || '00';
};

export const getFloorByNumber = (floorNum: number): FloorMetric => {
  const match = Object.values(FLOOR_METRICS).find(m => m.floorNumber === floorNum);
  return match || { floorNumber: floorNum, displayCode: String(floorNum), altitude: '±0.0m', altitudeMeters: 0 };
};

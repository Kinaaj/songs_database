export const COLOR_OPTIONS = [
  { key: 'gray', label: 'Šedá (Sloka)', color: '#94a3b8' },
  { key: 'yellow', label: 'Žlutá (Refrén)', color: '#fbbf24' },
  { key: 'blue', label: 'Modrá (Bridge)', color: '#818cf8' },
  { key: 'green', label: 'Zelená (Intro/Outro)', color: '#34d399' },
  { key: 'purple', label: 'Fialová', color: '#c084fc' }
];

export function getBlockColorClass(block) {
  if (block?.color) return `color-${block.color}`;
  const t = (block?.type || '').toLowerCase();
  if (t.includes('refr') || t.includes('chorus')) return 'color-yellow';
  if (t.includes('bridge')) return 'color-blue';
  return 'color-gray';
}

export const INSTRUMENT_COLORS = [
  { key: 'blue', label: 'Modrá', color: '#60a5fa' },
  { key: 'red', label: 'Červená', color: '#f87171' },
  { key: 'green', label: 'Zelená', color: '#34d399' },
  { key: 'yellow', label: 'Žlutá', color: '#fbbf24' },
  { key: 'purple', label: 'Fialová', color: '#c084fc' },
  { key: 'orange', label: 'Oranžová', color: '#fb923c' }
];

export function getInstrumentColor(song, inst) {
  return song?.instrumentColors?.[inst] || '#60a5fa';
}

import { STATS } from './stats.js';
import { EFFECTS } from './effects/index.js';

// Bump this if the URL format ever changes, so old OBS links can still be read
export const VERSION = 1;

const base = [
  // these come from the pasted ROTK link, not from a form field
  { id: 'key', type: 'hidden', default: '' },
  { id: 'region', type: 'hidden', default: 'na' },
  { id: 'mode', type: 'hidden', default: 'solo' },

  {
    id: 'stats',
    type: 'multi',
    label: 'Stats to show',
    group: 'Stats',
    options: STATS.map((s) => [s.id, s.label]),
    default: STATS.filter((s) => s.on).map((s) => s.id),
  },

  { id: 'showLabels', type: 'checkbox', label: 'Show labels', default: true, group: 'Labels' },
  { id: 'separator', type: 'text', label: 'Between label and number', default: ': ', group: 'Labels' },
  { id: 'labelColor', type: 'color', label: 'Label color', default: '#ffffff', group: 'Labels' },

  { id: 'font', type: 'font', label: 'Font', default: 'Baloo 2', group: 'Text' },
  {
    id: 'weight',
    type: 'select',
    label: 'Weight',
    default: '800',
    options: { 400: 'Regular', 500: 'Medium', 600: 'Semi bold', 700: 'Bold', 800: 'Extra bold', 900: 'Black' },
    group: 'Text',
  },
  { id: 'size', type: 'number', label: 'Size (px)', default: 32, min: 10, max: 150, step: 1, group: 'Text' },
  { id: 'color', type: 'color', label: 'Number color', default: '#ff7ec8', group: 'Text' },
  {
    id: 'layout',
    type: 'select',
    label: 'Layout',
    default: 'column',
    options: { column: 'Stacked', row: 'Side by side' },
    group: 'Text',
  },
  {
    id: 'align',
    type: 'select',
    label: 'Alignment',
    default: 'flex-start',
    options: { 'flex-start': 'Left', center: 'Center', 'flex-end': 'Right' },
    group: 'Text',
  },
  { id: 'gap', type: 'number', label: 'Space between stats (px)', default: 4, min: 0, max: 200, step: 1, group: 'Text' },

  { id: 'shadowColor', type: 'color', label: 'Shadow color', default: '#4a1747', group: 'Shadow' },
  { id: 'shadowOpacity', type: 'number', label: 'Shadow opacity (%)', default: 100, min: 0, max: 100, step: 5, group: 'Shadow' },
  { id: 'shadowX', type: 'number', label: 'Left / right (px)', default: 2, min: -50, max: 50, step: 1, group: 'Shadow' },
  { id: 'shadowY', type: 'number', label: 'Up / down (px)', default: 3, min: -50, max: 50, step: 1, group: 'Shadow' },
  { id: 'shadowBlur', type: 'number', label: 'Blur (px)', default: 0, min: 0, max: 50, step: 1, group: 'Shadow' },

  {
    id: 'fx',
    type: 'multi',
    label: 'Effects',
    group: 'Animation',
    look: 'checks', // plain checkboxes instead of chips
    options: EFFECTS.map((e) => [e.id, e.label]),
    default: EFFECTS.filter((e) => e.on).map((e) => e.id),
  },

  { id: 'refresh', type: 'number', label: 'Check for new stats every (seconds)', default: 60, min: 30, max: 600, step: 10, group: 'Refresh' },
];

// each effect brings its own settings along
export const SCHEMA = [...base, ...EFFECTS.flatMap((e) => e.settings)];

export function defaults() {
  const out = {};
  for (const f of SCHEMA) out[f.id] = Array.isArray(f.default) ? [...f.default] : f.default;
  return out;
}

// Only stores what's different from the defaults, which keeps OBS links short
export function toParams(settings) {
  const p = new URLSearchParams({ v: VERSION });
  for (const f of SCHEMA) {
    const val = settings[f.id];
    if (f.type === 'multi') {
      if (val.join(',') !== f.default.join(',')) p.set(f.id, val.join(','));
    } else if (f.type === 'checkbox') {
      if (val !== f.default) p.set(f.id, val ? '1' : '0');
    } else if (String(val) !== String(f.default)) {
      p.set(f.id, val);
    }
  }
  return p;
}

export function fromParams(search) {
  const p = new URLSearchParams(search);
  const s = defaults();
  // only one version so far. If VERSION ever goes up, translate old links here using p.get('v')
  for (const f of SCHEMA) {
    if (!p.has(f.id)) continue;
    const raw = p.get(f.id);
    if (f.type === 'multi') s[f.id] = raw.split(',').filter(Boolean);
    else if (f.type === 'checkbox') s[f.id] = raw === '1';
    else if (f.type === 'number') s[f.id] = Number(raw);
    else s[f.id] = raw;
  }
  return s;
}

import { fetchStats, SAMPLE } from './api.js';
import { fromParams } from './settings.js';
import { createRenderer } from './render.js';
import { EFFECTS } from './effects/index.js';

const root = document.getElementById('stats');
const msg = document.getElementById('msg');
const isPreview = new URLSearchParams(location.search).has('preview');
if (isPreview) document.documentElement.classList.add('preview');

let settings = fromParams(location.search);
let data = null;
let timer = null;
const render = createRenderer(root);

function applyStyle(s) {
  const css = document.documentElement.style;
  css.setProperty('--font', `"${s.font}", "Baloo 2", sans-serif`);
  css.setProperty('--weight', s.weight);
  css.setProperty('--size', s.size + 'px');
  css.setProperty('--color', s.color);
  css.setProperty('--label', s.labelColor);
  css.setProperty('--dir', s.layout);
  css.setProperty('--align', s.align);
  css.setProperty('--gap', s.gap + 'px');
  css.setProperty(
    '--shadow',
    `${s.shadowX}px ${s.shadowY}px ${s.shadowBlur}px ${withAlpha(s.shadowColor, s.shadowOpacity)}`
  );
  loadFont(s.font, s.weight);
}

function withAlpha(hex, percent) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${percent / 100})`;
}


let currentFont = '';
function loadFont(name, weight) {
  if (currentFont === name + weight) return;
  currentFont = name + weight;

  let link = document.getElementById('font');
  if (!link) {
    link = document.createElement('link');
    link.id = 'font';
    link.rel = 'stylesheet';
    document.head.append(link);
  }

  const family = name.trim().replace(/ /g, '+');
  // some fonts only come in one weight, and google errors if you ask for one that doesn't exist
  link.onerror = () => {
    link.onerror = null;
    link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
  };
  link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`;
}

function celebrate(el) {
  for (const fx of EFFECTS) {
    if (settings.fx.includes(fx.id)) fx.play(el, settings);
  }
}

function draw({ animate = true } = {}) {
  if (!data) return;
  const changed = render(data, settings);
  if (animate) changed.forEach(celebrate);
}

function say(text) {
  msg.textContent = text;
}

async function refresh() {
  if (!settings.key) {
    if (isPreview) {
      data = SAMPLE;
      draw();
    } else {
      say('No ROTK link in this overlay yet. Make one on the settings page.');
    }
    return;
  }

  try {
    data = await fetchStats(settings);
    say('');
    draw();
  } catch (err) {
    console.warn('ROTK overlay:', err);
    // keep showing the last good numbers if we have them
    if (!data) say("Can't load stats from ROTK. Check that the link is right.");
  }
}

function start() {
  clearInterval(timer);
  refresh();
  timer = setInterval(refresh, Math.max(30, settings.refresh) * 1000);
}

// The preview on the settings page sends us new settings as you change them
window.addEventListener('message', (e) => {
  if (e.origin !== location.origin || !e.data) return;

  if (e.data.type === 'settings') {
    const next = fromParams(e.data.search);
    const newPlayer = next.key !== settings.key || next.region !== settings.region || next.mode !== settings.mode;
    settings = next;
    applyStyle(settings);
    if (newPlayer) {
      data = null;
      render.reset();
      start();
    } else {
      draw({ animate: false });
    }
  }

  if (e.data.type === 'test') {
    root.querySelectorAll('.stat:not([hidden]) .value').forEach(celebrate);
  }
});

applyStyle(settings);
start();

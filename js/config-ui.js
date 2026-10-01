import { SCHEMA, defaults, toParams, fromParams } from './settings.js';
import { PRESETS } from './presets.js';
import { parseRotkLink } from './api.js';
import { FONTS } from './fonts.js';

const form = document.getElementById('settings');
const preview = document.getElementById('preview');
const output = document.getElementById('output');
const linkInput = document.getElementById('rotk-link');
const linkStatus = document.getElementById('link-status');

let state = location.search ? fromParams(location.search) : defaults();

// id -> function that pushes the current state back into that field's input
const syncers = {};

// tiny helper so building the form isn't 300 lines of createElement
function h(tag, props = {}, ...kids) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...kids.filter((k) => k != null));
  return node;
}

function set(id, value) {
  state[id] = value;
  changed();
}

// dropdown grouped by style, "Other" lets you type any Google Font
function fontField(f) {
  const id = 'f-' + f.id;
  const known = Object.values(FONTS).flat();

  const select = h(
    'select',
    { id },
    ...Object.entries(FONTS).map(([group, names]) =>
      h('optgroup', { label: group }, ...names.map((n) => h('option', { value: n }, n)))
    ),
    h('option', { value: 'other' }, 'Other Google Font…')
  );
  const other = h('input', { type: 'text', placeholder: 'Exact name from fonts.google.com', spellcheck: false });
  other.setAttribute('aria-label', 'Google Font name');

  function sync() {
    const listed = known.includes(state[f.id]);
    select.value = listed ? state[f.id] : 'other';
    other.hidden = listed;
    if (!listed) other.value = state[f.id];
  }

  select.addEventListener('change', () => {
    if (select.value === 'other') {
      other.hidden = false;
      other.focus();
      if (other.value.trim()) set(f.id, other.value.trim());
    } else {
      other.hidden = true;
      set(f.id, select.value);
    }
  });
  other.addEventListener('input', () => {
    if (other.value.trim()) set(f.id, other.value.trim());
  });

  syncers[f.id] = sync;
  sync();
  return h('div', { className: 'field' }, h('label', { htmlFor: id }, f.label), h('div', { className: 'font-pick' }, select, other));
}

function makeField(f) {
  const id = 'f-' + f.id;

  if (f.type === 'font') return fontField(f);

  if (f.type === 'checkbox') {
    const input = h('input', { type: 'checkbox', id, checked: state[f.id] });
    input.addEventListener('change', () => set(f.id, input.checked));
    syncers[f.id] = () => (input.checked = state[f.id]);
    return h('label', { className: 'field check' }, input, h('span', {}, f.label));
  }

  if (f.type === 'multi') {
    const boxes = f.options.map(([value, text]) => {
      const input = h('input', { type: 'checkbox', value, checked: state[f.id].includes(value) });
      input.addEventListener('change', () => {
        // keep them in schema order, not click order
        set(f.id, f.options.map(([v]) => v).filter((v) => boxes.find((b) => b.value === v).checked));
      });
      return input;
    });
    syncers[f.id] = () => boxes.forEach((b) => (b.checked = state[f.id].includes(b.value)));
    if (f.look === 'checks') {
      return h(
        'div',
        {},
        ...boxes.map((b, i) => h('label', { className: 'field check' }, b, h('span', {}, f.options[i][1])))
      );
    }
    return h(
      'div',
      { className: 'pills' },
      ...boxes.map((b, i) => h('label', { className: 'pill' }, b, h('span', {}, f.options[i][1])))
    );
  }

  let input;
  if (f.type === 'select') {
    input = h('select', { id }, ...Object.entries(f.options).map(([v, t]) => h('option', { value: v }, t)));
  } else if (f.type === 'number') {
    input = h('input', { type: 'number', id, min: f.min, max: f.max, step: f.step ?? 1 });
  } else if (f.type === 'color') {
    input = h('input', { type: 'color', id });
  } else {
    input = h('input', { type: 'text', id });
  }

  input.value = state[f.id];
  input.addEventListener('input', () => {
    if (f.type === 'number') {
      if (input.value === '') return;
      set(f.id, Number(input.value));
    } else {
      set(f.id, input.value);
    }
  });
  syncers[f.id] = () => (input.value = state[f.id]);

  return h('div', { className: 'field' }, h('label', { htmlFor: id }, f.label), input);
}

function buildForm() {
  const groups = new Map();
  for (const f of SCHEMA) {
    if (f.type === 'hidden') continue;
    if (!groups.has(f.group)) groups.set(f.group, []);
    groups.get(f.group).push(f);
  }

  for (const [name, fields] of groups) {
    const box = h('fieldset', { className: 'group' }, h('legend', {}, name));
    if (name === 'Text') box.append(presetRow());
    fields.forEach((f) => box.append(makeField(f)));
    form.append(box);
  }
}

function presetRow() {
  const buttons = PRESETS.map((p) => {
    const b = h('button', { type: 'button', className: 'preset' }, p.name);
    b.style.setProperty('--swatch', p.values.color);
    b.style.setProperty('--swatch-shadow', p.values.shadowColor);
    b.addEventListener('click', () => {
      Object.assign(state, p.values);
      Object.keys(p.values).forEach((k) => syncers[k]?.());
      changed();
    });
    return b;
  });
  return h('div', { className: 'field stacked' }, h('span', { className: 'field-title' }, 'Color themes'), h('div', { className: 'presets' }, ...buttons));
}

// ---- the ROTK link box ----

function showLinkStatus() {
  if (state.key) {
    linkStatus.textContent = `Found your stats: ${state.region.toUpperCase()}, ${state.mode}.`;
    linkStatus.dataset.ok = 'yes';
  } else if (linkInput.value.trim()) {
    linkStatus.textContent = "That doesn't look like a ROTK overlay link. It should start with https://rotk.app/overlay/";
    linkStatus.dataset.ok = 'no';
  } else {
    linkStatus.textContent = 'The preview is using made-up numbers until you paste your link.';
    linkStatus.dataset.ok = '';
  }
}

linkInput.addEventListener('input', () => {
  const text = linkInput.value;

  // pasting one of *our* overlay links loads all its settings, handy for editing
  if (text.includes('overlay.html?') && !text.includes('rotk.app')) {
    try {
      state = fromParams(new URL(text.trim()).search);
      Object.values(syncers).forEach((sync) => sync());
      linkInput.value = rotkLinkFromState();
    } catch {}
  } else {
    const found = parseRotkLink(text);
    state.key = found?.key ?? '';
    state.region = found?.region ?? 'na';
    state.mode = found?.mode ?? 'solo';
  }
  showLinkStatus();
  changed();
});

function rotkLinkFromState() {
  return state.key ? `https://rotk.app/overlay/${state.key}?region=${state.region}&mode=${state.mode}` : '';
}

// ---- preview + output ----

function changed() {
  const params = toParams(state);
  const overlayUrl = new URL('overlay.html?' + params, location.href).href;
  output.value = state.key ? overlayUrl : '';
  output.placeholder = 'Paste your ROTK link above to get your OBS link.';
  document.getElementById('copy').disabled = !state.key;

  // keep the settings page URL in sync so a refresh doesn't lose your work
  history.replaceState(null, '', '?' + params);

  preview.contentWindow?.postMessage({ type: 'settings', search: params.toString() }, location.origin);
}

document.getElementById('copy').addEventListener('click', async (e) => {
  const button = e.currentTarget;
  try {
    await navigator.clipboard.writeText(output.value);
  } catch {
    output.select();
    document.execCommand('copy');
  }
  button.textContent = 'Copied';
  setTimeout(() => (button.textContent = 'Copy link'), 1500);
});

document.getElementById('test').addEventListener('click', () => {
  preview.contentWindow?.postMessage({ type: 'test' }, location.origin);
});

document.getElementById('reset').addEventListener('click', () => {
  const { key, region, mode } = state;
  state = { ...defaults(), key, region, mode };
  Object.values(syncers).forEach((sync) => sync());
  changed();
});

document.querySelectorAll('[name="stage-bg"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    document.getElementById('stage').dataset.bg = radio.value;
  });
});

buildForm();
linkInput.value = rotkLinkFromState();
showLinkStatus();
preview.src = 'overlay.html?preview&' + toParams(state);
preview.addEventListener('load', changed);
changed();

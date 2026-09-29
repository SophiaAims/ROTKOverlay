import { STATS } from './stats.js';

// Keeps one row per stat alive between refreshes so we can tell what changed.
// Returns the value elements whose text changed, so the effects know what to animate.
export function createRenderer(root) {
  let rows = new Map();
  let shape = '';

  function render(data, s) {
    const visible = STATS.filter((stat) => s.stats.includes(stat.id));

    // only rebuild when the set of stats (or labels on/off) changes
    const newShape = visible.map((v) => v.id).join() + '|' + s.showLabels;
    if (newShape !== shape) {
      root.textContent = '';
      rows = new Map();
      for (const stat of visible) {
        const row = document.createElement('div');
        row.className = 'stat';
        const label = s.showLabels ? document.createElement('span') : null;
        if (label) {
          label.className = 'label';
          row.append(label);
        }
        const value = document.createElement('span');
        value.className = 'value';
        row.append(value);
        root.append(row);
        rows.set(stat.id, { row, label, value, last: undefined });
      }
      shape = newShape;
    }

    const changed = [];
    for (const stat of visible) {
      const r = rows.get(stat.id);
      const val = stat.get(data);
      r.row.hidden = val == null;
      if (val == null) continue;

      if (r.label) r.label.textContent = stat.label + s.separator;
      const text = String(val);
      if (r.last !== undefined && r.last !== text) changed.push(r.value);
      r.value.textContent = text;
      r.last = text;
    }
    return changed;
  }

  // forget the old values, e.g. when switching to a different player's link
  render.reset = () => {
    shape = '';
    root.textContent = '';
  };

  return render;
}

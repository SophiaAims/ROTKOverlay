// Light / dark / auto toggle for the settings page. The overlay itself doesn't care.
// The inline script in index.html's <head> applies the saved choice early so the page doesn't flash.

const KEY = 'theme';
const buttons = document.querySelectorAll('[data-theme-choice]');

function apply(choice) {
  if (choice === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = choice;
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeChoice === choice)));
}

function saved() {
  try {
    return localStorage.getItem(KEY) || 'auto';
  } catch {
    return 'auto';
  }
}

buttons.forEach((b) =>
  b.addEventListener('click', () => {
    const choice = b.dataset.themeChoice;
    try {
      localStorage.setItem(KEY, choice);
    } catch {}
    apply(choice);
  })
);

apply(saved());

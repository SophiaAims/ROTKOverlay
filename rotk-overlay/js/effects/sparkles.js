export default {
  id: 'sparkles',
  label: 'Sparkles',
  on: true,
  settings: [
    { id: 'sparkleEmojis', type: 'text', label: 'Sparkle emojis', default: '✨💖⭐✨', group: 'Animation' },
    { id: 'sparkleSize', type: 'number', label: 'Sparkle size', default: 18, min: 8, max: 80, step: 1, group: 'Animation' },
  ],

  play(el, s) {
    const pieces = splitEmoji(s.sparkleEmojis);
    const size = Number(s.sparkleSize) || 18;
    const box = el.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;

    pieces.forEach((emoji, i) => {
      const bit = document.createElement('span');
      bit.textContent = emoji;
      Object.assign(bit.style, {
        position: 'fixed',
        left: cx - size / 2 + 'px',
        top: cy - size / 2 + 'px',
        fontSize: size + 'px',
        lineHeight: 1,
        pointerEvents: 'none',
        textShadow: 'none',
      });
      document.body.append(bit);

      // spread them out evenly in a circle, drifting up a little
      const angle = (i / pieces.length) * Math.PI * 2 + 0.6;
      const dx = Math.cos(angle) * size * 2.2;
      const dy = Math.sin(angle) * size * 1.9 - size * 0.5;

      bit.animate(
        [
          { opacity: 1, transform: 'translate(0, 0) scale(.4)' },
          { opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(1.2)` },
        ],
        { duration: 1000, easing: 'ease-out' }
      ).onfinish = () => bit.remove();
    });
  },
};

// emojis like 💖 are more than one character, so a plain split() chops them up
function splitEmoji(text = '') {
  if (Intl.Segmenter) {
    return [...new Intl.Segmenter().segment(text)].map((p) => p.segment).filter((p) => p.trim());
  }
  return Array.from(text).filter((p) => p.trim());
}

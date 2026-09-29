export default {
  id: 'bounce',
  label: 'Bounce when a number changes',
  on: true,
  settings: [
    { id: 'bounceColor', type: 'color', label: 'Bounce color', default: '#7fe8ff', group: 'Animation' },
    {
      id: 'bounceSize',
      type: 'select',
      label: 'Bounce size',
      default: '1.45',
      options: { '1.2': 'Small', '1.45': 'Medium', '1.8': 'Big' },
      group: 'Animation',
    },
  ],

  play(el, s) {
    // color is part of the animation so it goes back to normal on its own
    el.animate(
      [
        { transform: 'scale(1)', color: s.bounceColor, easing: 'cubic-bezier(.3,1.6,.5,1)' },
        { transform: `scale(${s.bounceSize}) rotate(-6deg)`, color: s.bounceColor, offset: 0.3 },
        { transform: 'scale(1)', color: s.bounceColor, offset: 0.6 },
        { transform: 'scale(1)', color: s.color },
      ],
      { duration: 1200 }
    );
  },
};

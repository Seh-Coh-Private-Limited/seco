// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scans your components for class names
  ],
  theme: {
    extend: {fontFamily: {
      michelle: ['"Michelle"', 'sans-serif'], // Custom font
    },screens: {
      'mobile': {'max': '767px'},
      'tablet': {'min': '768px', 'max': '1023px'},
    },},
  },
  plugins: [
    require('tailwind-scrollbar-hide'), // Custom plugin
  ],
};

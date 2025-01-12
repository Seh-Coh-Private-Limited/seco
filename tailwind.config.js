// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scans your components for class names
  ],
  theme: {
    extend: {fontFamily: {
      michelle: ['"Michelle"', 'sans-serif'], // Custom font
    },},
  },
  plugins: [
    require('tailwind-scrollbar-hide'), // Custom plugin
  ],
};

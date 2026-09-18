/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        iron: {
          bg: '#0B0C0E',
          card: '#15171A',
          line: '#24262A',
          orange: '#F15A24',
          red: '#D93B32',
        },
      },
    },
  },
  plugins: [],
};

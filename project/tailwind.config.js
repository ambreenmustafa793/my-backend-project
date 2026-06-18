/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cyber-violet': '#8A2BE2',
        'electric-cyan': '#00FFFF',
        'midnight': '#030307',
      },
    },
  },
  plugins: [],
};

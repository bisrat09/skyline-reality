import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3f8',
          100: '#d9e0ed',
          200: '#b3c1db',
          300: '#8da2c9',
          400: '#6783b7',
          500: '#4164a5',
          600: '#345084',
          700: '#273c63',
          800: '#1B2A4A',
          900: '#0e1525',
        },
        gold: {
          50: '#faf6ef',
          100: '#f2e9d4',
          200: '#e5d3a9',
          300: '#d8bd7e',
          400: '#C4A265',
          500: '#b08c4a',
          600: '#8d703b',
          700: '#6a542c',
          800: '#46381d',
          900: '#231c0e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;

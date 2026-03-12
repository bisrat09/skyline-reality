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
        compass: {
          50: '#F7F9FC',
          100: '#EEF1F6',
          500: '#0070F3',
          600: '#005BC4',
          700: '#004A9E',
        },
        warm: {
          50: '#FAFAFA',
          100: '#F4F4F4',
          200: '#E8E8E8',
          300: '#D1D1D1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;

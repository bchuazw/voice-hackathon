import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        archimedes: {
          ink: '#0b1220',
          mist: '#e8eef7',
          accent: '#3a86ff'
        }
      }
    }
  },
  plugins: []
};

export default config;

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#22c55e',
          hover: '#16a34a',
        },
      },
    },
  },
  plugins: [],
};

export default config;

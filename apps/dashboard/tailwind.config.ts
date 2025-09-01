import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-text': '#0b1220',
        'cta': '#000000',
        'cta-contrast': '#ffffff',
      },
      backgroundImage: {
        'grad-cta': 'linear-gradient(135deg,#111,#1f2937,#0b1220)',
      },
      spacing: {
        '12': '3rem',
        '24': '6rem',
        '48': '12rem',
      },
    },
  },
  plugins: [],
}

export default config

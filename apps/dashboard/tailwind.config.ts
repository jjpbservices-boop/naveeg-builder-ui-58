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
        ink: 'var(--ink)',
        'ink-light': 'var(--ink-light)',
        surface: 'var(--surface)',
        'surface-dark': 'var(--surface-dark)',
        n50: 'var(--n50)', n100: 'var(--n100)', n200: 'var(--n200)', n300: 'var(--n300)',
        n400: 'var(--n400)', n500: 'var(--n500)', n600: 'var(--n600)', n700: 'var(--n700)',
        n800: 'var(--n800)', n900: 'var(--n900)',
        muted: 'var(--muted)', 'muted-light': 'var(--muted-light)',
        'accent-green': 'var(--accent-green)',
        'accent-blue': 'var(--accent-blue)',
        'accent-purple': 'var(--accent-purple)',
      },
      borderRadius: { xl: '1.2rem' },
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

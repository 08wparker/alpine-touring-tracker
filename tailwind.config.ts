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
        'alpine-blue': '#1e40af',
        'alpine-green': '#15803d',
        'alpine-green-light': '#16a34a',
        'alpine-green-dark': '#14532d',
        'mountain-gray': '#6b7280',
        'snow-white': '#f8fafc',
      },
    },
  },
  plugins: [],
}
export default config
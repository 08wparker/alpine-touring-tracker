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
        'alpine-green': '#1e3a5f',
        'alpine-green-light': '#2a4a72',
        'alpine-green-dark': '#0f1f3a',
        'mountain-gray': '#6b7280',
        'snow-white': '#f8fafc',
      },
    },
  },
  plugins: [],
}
export default config
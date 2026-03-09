/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0077BE',
        'primary-dark': '#005A8F',
        secondary: '#00A3E0',
        accent: '#FF6B35',
        success: '#06D6A0',
        warning: '#FFD23F',
      },
    },
  },
  plugins: [],
}

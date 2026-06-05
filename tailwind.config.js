/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf0ec',
          100: '#fad5ca',
          200: '#f4b49f',
          300: '#ed9278',
          400: '#e68570',
          500: '#e07968', // coral — primary
          600: '#c96554',
          700: '#b05242',
        },
        navy: {
          50:  '#ecedf5',
          100: '#d0d2e8',
          300: '#8b90c8',
          400: '#5c6499',
          500: '#3d4680',
          600: '#2a3270',
          700: '#16193b', // main navy
          800: '#0e1028',
          900: '#080b1a',
        },
        peach: {
          50:  '#fdfaf6',
          100: '#f8ede0',
          200: '#f0d8c0',
          300: '#e8c4a2', // main peach
          400: '#daa882',
          500: '#c48f64',
        },
        cream: {
          50:  '#fffdf9',
          100: '#fdf6ee', // main background
          200: '#f8ebda',
          300: '#f1dbc4',
        },
        warm: {
          400: '#b09a82',
          500: '#8b7260',
          600: '#6d5844',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

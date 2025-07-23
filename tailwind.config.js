/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#14e417',
        secondary: '#A3FF12',
      },
      screens: {
        '4k': '2560px',
        '2k': '2048px',
      }
    },
  },
  plugins: [],
}


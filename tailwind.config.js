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
    },
  },
  plugins: [],
}


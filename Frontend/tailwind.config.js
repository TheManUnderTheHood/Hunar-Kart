/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ Enables class-based dark mode
  content: [
    './index.html',
    './src/**/*.{js,jsx}', // ✅ Includes all component and page files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

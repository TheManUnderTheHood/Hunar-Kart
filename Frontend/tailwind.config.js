// ✅ tailwind.config.js (V4-compatible)

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-sky-500)',
        'primary-hover': 'var(--color-sky-600)',
        'primary-focus': 'var(--color-sky-400)',
      },
    },
  },
  plugins: [],
}

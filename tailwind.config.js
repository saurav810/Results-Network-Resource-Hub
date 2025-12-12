/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['SharpGrotesk', 'Public Sans', 'sans-serif'],
        display: ['SharpGrotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

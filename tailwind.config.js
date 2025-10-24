/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Sharp Grotesk 20"', 'Public Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
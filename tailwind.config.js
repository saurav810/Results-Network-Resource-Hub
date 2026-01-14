/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Body text: Public Sans (USWDS-aligned)
        sans: ['Public Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        // Headings only: Sharp Grotesk with Public Sans fallback
        display: ['SharpGrotesk', 'Public Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

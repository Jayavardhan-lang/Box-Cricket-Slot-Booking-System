/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a5c2a',
          dark: '#134520',
          light: '#2d7a3f',
        },
        secondary: {
          DEFAULT: '#f5a623',
          dark: '#d4891a',
          light: '#f7bc5a',
        },
        success: '#16a34a',
        error: '#dc2626',
        warning: '#d97706',
        bg: '#f9f9f9',
        textPrimary: '#1a1a1a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

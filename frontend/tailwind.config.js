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
          DEFAULT: '#00c853', // Bright cricket green
          dark: '#1b5e20',    // Deep forest green
          light: '#00e676',   // Bright success/active green
        },
        secondary: {
          DEFAULT: '#ffd700', // Premium gold
          dark: '#ff6f00',    // Deep gold/orange
          light: '#ffecb3',   // Light gold tint
        },
        brand: {
          dark: '#0a0a0a',
          card: '#111111',
          hover: '#1e1e1e',
          greyLight: '#f5f5f5',
          greyMedium: '#9e9e9e',
          greyDark: '#1a1a1a',
        },
        success: '#00e676',
        error: '#ff1744',
        warning: '#ff9100',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        accent: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

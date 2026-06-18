
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00c853', 
          dark: '#1b5e20',    
          light: '#00e676',   
        },
        secondary: {
          DEFAULT: '#ffd700', 
          dark: '#ff6f00',    
          light: '#ffecb3',   
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

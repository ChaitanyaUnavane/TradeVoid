/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tv: {
          crimson: '#DC143C',
          emerald: '#50C878',
          slate: '#708090',
          dark: '#000000', // UPDATED: Pitch Black
          card: '#121212',
          text: '#EAEAEA'
        }
      },
      fontFamily: {
        mono: ['Consolas', 'Monaco', 'monospace'],
      }
    },
  },
  plugins: [],
}
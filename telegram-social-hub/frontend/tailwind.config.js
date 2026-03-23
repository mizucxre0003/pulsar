/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0F0F0F',
          800: '#1A1A1A',
        },
        light: {
          100: '#F5F5F5',
          200: '#E0E0E0',
        }
      },
      borderRadius: {
        '2xl': '1.5rem',
        '3xl': '2rem',
        'squircle': '24px',
      }
    },
  },
  plugins: [],
}

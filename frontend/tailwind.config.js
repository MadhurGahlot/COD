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
          bg: '#111110',
          surface: '#181816',
          card: '#1D1C1A',
          border: '#2A2926',
          text: '#F5F4F0',
          muted: '#9E9C96',
        },
        light: {
          bg: '#EBE9E5',
          surface: '#F2F0EC',
          card: '#FFFFFF',
          border: '#DCD9D0',
          text: '#121110',
          muted: '#63625C',
        },
        accent: {
          DEFAULT: '#F97316', // Iconic tactical COD orange
          hover: '#EA580C',
          light: '#FB923C',
          dark: '#C2410C',
          glow: 'rgba(249, 115, 22, 0.20)',
          amber: '#F59E0B',
          cyan: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Geist', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'card-light': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}

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
          DEFAULT: '#007AFF',
          dark: '#0051D5',
          light: '#4DA3FF',
        },
        charcoal: {
          DEFAULT: '#333333',
          light: '#4D4D4D',
          lighter: '#666666',
        },
        accent: {
          DEFAULT: '#FF9500',
          dark: '#CC7700',
          light: '#FFB347',
        },
        background: '#F9F9FC',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
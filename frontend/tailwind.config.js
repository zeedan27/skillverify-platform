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
        main: '#FFDC58',
        'main-hover': '#F5D13B',
        'main-foreground': '#000000',
        canvas: '#FFFDF5',
        'success-mint': '#B4F481',
        'alert-red': '#EF4444',
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        }
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px var(--neo-shadow)',
        'neo': '4px 4px 0px 0px var(--neo-shadow)',
        'neo-lg': '8px 8px 0px 0px var(--neo-shadow)',
        'neo-xl': '12px 12px 0px 0px var(--neo-shadow)',
        'neo-green': '8px 8px 0px 0px #22C55E',
        'neo-red': '8px 8px 0px 0px #EF4444',
      },
      borderWidth: {
        '3': '3px',
      },
      borderRadius: {
        'base': '10px',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

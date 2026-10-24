/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        ivory: {
          50: '#FDFDFC',
          100: '#FBFBFA',
          200: '#F5F5F0',
          300: '#ECECE5',
          400: '#DFDFD6',
        },
        forest: {
          50: '#F0F7F5',
          100: '#DCEDE8',
          600: '#165C4F',
          700: '#114B40',
          800: '#0D382F',
          900: '#092822',
          950: '#051915',
          DEFAULT: '#0D382F',
        },
        triage: {
          red: '#D93829',
          'red-light': '#FEF2F2',
          'red-border': '#FDC8C8',
          yellow: '#E59819',
          'yellow-light': '#FFFBEB',
          'yellow-border': '#FDE68A',
          green: '#228B53',
          'green-light': '#ECFDF5',
          'green-border': '#A7F3D0',
          black: '#1C1E21',
          'black-light': '#F3F4F6',
          'black-border': '#E5E7EB',
        },
        charcoal: {
          950: '#0E1012',
          900: '#16191D',
          800: '#2A2F37',
          700: '#434A54',
          600: '#5F6876',
          500: '#7B8494',
          400: '#9DA6B4',
          300: '#C2C9D4',
          200: '#E2E6EC',
          100: '#F1F3F6',
        }
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.03), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'apple': '0 4px 20px -2px rgba(13, 56, 47, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'apple-hover': '0 10px 30px -4px rgba(13, 56, 47, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out both',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-down': 'fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      }
    },
  },
  plugins: [],
}

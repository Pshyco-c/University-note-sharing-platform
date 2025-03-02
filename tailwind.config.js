/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        modern: {
          light: {
            bg: '#eef2f6', // Much lighter grayish blue background
            card: '#ffffff', // Pure white cards
            'card-hover': '#ffffff',
            border: '#cbd5e1', // Stronger border color
            text: '#1e293b',
            'text-secondary': '#475569',
            accent: '#f1f5f9',
            highlight: '#7c3aed',
            input: '#f8fafc', // Light gray input background
            'input-hover': '#f1f5f9', // Slightly darker on hover
            'input-border': '#94a3b8' // Distinct input border color
          },
          dark: {
            bg: '#0a0f1a', // Darkest background
            card: '#1a1f2e', // Dark blue-gray for cards
            'card-hover': '#232838', // Slightly lighter on hover
            border: '#2d3548', // Blue-gray border
            text: '#e2e8f0',
            'text-secondary': '#94a3b8',
            accent: '#232838',
            highlight: '#a78bfa',
            input: '#141824', // Darker input background for contrast with cards
            'input-hover': '#1c2230', // Slightly lighter on hover
            'input-border': '#2d3548', // Matching border color
            'input-focus': '#3b4659' // Visible focus state
          }
        },
        accent: {
          teal: '#0ea5e9',
          rose: '#f43f5e',
          emerald: '#10b981',
          violet: '#8b5cf6',
          'teal-light': '#38bdf8',
          'rose-light': '#fb7185',
          'emerald-light': '#34d399',
          'violet-light': '#a78bfa',
          // Gradients
          'gradient-start': '#6d28d9',
          'gradient-end': '#0ea5e9',
          'gradient-start-dark': '#8b5cf6',
          'gradient-end-dark': '#38bdf8'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'scale': 'scale 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'soft-lg': '0 10px 30px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'glow': '0 0 20px rgba(124, 58, 237, 0.3)',
        'glow-teal': '0 0 20px rgba(14, 165, 233, 0.3)',
        'glow-lg': '0 0 30px rgba(124, 58, 237, 0.4)',
        'card': '0 8px 16px -2px rgba(0, 0, 0, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'input': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'dark-card': '0 8px 16px -2px rgba(0, 0, 0, 0.5), 0 4px 8px -2px rgba(0, 0, 0, 0.3)',
        'dark-card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        'dark-input': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)'
      }
    },
  },
  plugins: [],
};

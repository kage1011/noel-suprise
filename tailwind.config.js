/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: '#D42426',
          darkred: '#8B0000',
          green: '#165B33',
          darkgreen: '#0F381E',
          gold: '#F8B229',
          cream: '#FBEED9',
          ice: '#EBF4F6'
        }
      },
      fontFamily: {
        christmas: ['"Mountains of Christmas"', 'cursive', 'sans-serif'],
        display: ['"Cinzel Decorative"', 'serif', 'sans-serif'],
        sans: ['"Quicksand"', 'sans-serif']
      },
      animation: {
        'snow-fall': 'snowfall 10s linear infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        snowfall: {
          '0%': { transform: 'translateY(-10px) translateX(0)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) translateX(50px)', opacity: '0.2' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(248, 178, 41, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(248, 178, 41, 0.9), 0 0 50px rgba(212, 36, 38, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}

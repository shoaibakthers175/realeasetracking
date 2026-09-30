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
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          primary: '#e62e3d',
          glow: 'rgba(230, 46, 61, 0.25)',
        },
        dark: {
          bg: '#090b10',
          surface: '#0f131a',
          card: '#141a24',
          cardHover: '#18202d',
          border: '#1e2638',
          borderSubtle: '#19202f',
          text: '#f1f5f9',
          muted: '#8b9bb4',
        },
        light: {
          bg: '#f8fafc',
          surface: '#ffffff',
          card: '#ffffff',
          cardHover: '#f8fafc',
          border: '#e2e8f0',
          borderSubtle: '#edf2f7',
          text: '#0f172a',
          muted: '#64748b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(230, 46, 61, 0.15)',
        'glow': '0 0 25px rgba(230, 46, 61, 0.25)',
        'glow-lg': '0 0 40px rgba(230, 46, 61, 0.35)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'card-light': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'red-wave-dark': 'linear-gradient(135deg, rgba(230,46,61,0.12) 0%, transparent 50%)',
        'red-wave-light': 'linear-gradient(135deg, rgba(230,46,61,0.06) 0%, transparent 60%)',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        canvas: {
          bg: '#f5f5f7',
          card: '#ffffff',
          border: '#d2d2d7',
          text: '#1d1d1f',
          muted: '#86868b',
          accent: '#0071e3',
        }
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      }
    },
  },
  plugins: [],
}

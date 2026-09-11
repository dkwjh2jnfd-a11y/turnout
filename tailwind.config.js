/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#050B18',
          900: '#0A1630',
          800: '#0F2044',
          700: '#162C57',
          600: '#1F3B70',
          500: '#2C4E8F',
        },
        lime: {
          400: '#D4F462',
          500: '#C3EE3A',
          600: '#A8D420',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sheet: '0 -8px 30px rgba(5, 11, 24, 0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}

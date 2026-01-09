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
          DEFAULT: '#1E88E5', // Solar Blue
          foreground: '#FFFFFF',
        },
        success: '#43A047', // PV Active
        warning: '#F9A825',
        critical: '#E53935',
        offline: '#9E9E9E',
        background: '#F5F7FA',
        card: '#FFFFFF',
        text: {
          primary: '#263238',
          sub: '#607D8B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'title-xl': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
        'title-l': ['20px', { lineHeight: '1.2', fontWeight: '700' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.5', fontWeight: '500' }],
        'kpi': ['32px', { lineHeight: '1.1', fontWeight: '600' }],
      }
    },
  },
  plugins: [],
}

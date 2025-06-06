/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          'arabic': ['var(--font-cairo)', 'Cairo', 'sans-serif'],
          'english': ['var(--font-inter)', 'Inter', 'sans-serif'],
        },
        colors: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          secondary: {
            50: '#fafaf9',
            100: '#f5f5f4',
            200: '#e7e5e4',
            300: '#d6d3d1',
            400: '#a8a29e',
            500: '#78716c',
            600: '#57534e',
            700: '#44403c',
            800: '#292524',
            900: '#1c1917',
          }
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
        },
        animation: {
          'fade-in': 'fadeIn 0.3s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'bounce-gentle': 'bounceGentle 2s infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          bounceGentle: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-5px)' },
          }
        }
      },
    },
    plugins: [
      // دعم RTL بسيط
      function({ addUtilities }) {
        addUtilities({
          // margins واتجاهات بسيطة
          '.ms-auto': { 'margin-inline-start': 'auto' },
          '.me-auto': { 'margin-inline-end': 'auto' },
          '.ps-4': { 'padding-inline-start': '1rem' },
          '.pe-4': { 'padding-inline-end': '1rem' },
          '.text-start': { 'text-align': 'start' },
          '.text-end': { 'text-align': 'end' },
          '.start-0': { 'inset-inline-start': '0' },
          '.end-0': { 'inset-inline-end': '0' },
        })
      },
    ],
  }
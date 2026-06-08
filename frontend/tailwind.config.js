/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        toss: {
          blue: '#3182F6',
          'blue-light': '#EBF3FE',
          bg: '#F2F4F6',
          black: '#191F28',
          gray1: '#6B7684',
          gray2: '#8B95A1',
          line: '#E5E8EB',
          red: '#F04452',
          green: '#05D686',
          orange: '#FF8C00',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

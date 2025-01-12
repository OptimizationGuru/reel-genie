/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // bodyColor: "#212428",
        lightText: '#c4cfde',
        boxBg: '#23272b',
        // designColor: "#ff014f",
        designColor: '#ff014f',
        bodyColor: '#121212',
      },
    },
  },
  plugins: [],
}

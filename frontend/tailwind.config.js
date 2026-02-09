/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        // 'primary':'#5f6FFF'
        'primary':'#3E3C7F'
      },
      gridTemplateColumns:{
        'auto':'repeat(auto-fill,minmax(175px,1fr))'
      }
    },
  },
  plugins: [],
};

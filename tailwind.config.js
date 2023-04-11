/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        loading: {
          "0%": {
            opacity: 0,
          },
        },
      },
      animation: {
        load: "loading 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}

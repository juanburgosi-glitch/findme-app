/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: "#13a4ec",
        "background-dark": "#101c22",
        "card-dark": "#1a2831",
        "border-dark": "#2a3c47",
      },
      fontFamily: {
        display: ["Inter"],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

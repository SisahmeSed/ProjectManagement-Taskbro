// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:   "#6246EA",
        "primary-hover": "#4f35d2",
        surface:   "#D1D1E9",
        "surface-2": "#EBEBF5",
        heading:   "#2B2C34",
        paragraph: "#2B2C34",
        danger:    "#E45858",
        border:    "#2B2C34",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(43,44,52,0.08)",
        panel: "0 8px 32px rgba(43,44,52,0.12)",
      },
    },
  },
  plugins: [],
}
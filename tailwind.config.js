/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  
  theme: {
    extend: {
      colors: {
        // Paleta "buk" (ejemplo, coloca tus hex reales)
        buk: {
          50: "#000000",
          100: "#e3efff",
          200: "#c7ddff",
          300: "#a3c6ff",
          400: "#6fa3ff",
          500: "#2f4daa", // <— primario
          600: "#2563eb",
          700: "#1d4ed8", // <— títulos azules
          800: "#d9d9d9", // <— Fondo 
          900: "#172554",
        },
        // Si quieres un acento secundario
        bukOrange: {
          500: "#f59e0b",
          600: "#d97706",
        },
      },
    },
  },
  plugins: [],

}

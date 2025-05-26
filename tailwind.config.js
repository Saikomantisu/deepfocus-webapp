/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0f0f23",
          surface: "#1a1a2e",
          card: "#16213e",
          accent: "#0f3460",
          text: "#e94560",
          muted: "#a0a0a0",
        },
      },
    },
  },
  plugins: [],
};

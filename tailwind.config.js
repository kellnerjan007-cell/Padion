/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0D0D1A",
        surface: "#1A1A2E",
        accent: "#E94560",
        secondary: "#0F3460",
        success: "#00C853",
        warning: "#FFB300",
        primary: "#FFFFFF",
        muted: "#A0A0B0",
      },
    },
  },
  plugins: [],
};

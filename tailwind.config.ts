import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
      animation: {
        "breathe-in": "breatheIn 4s ease-in-out forwards",
        "breathe-hold": "breatheHold 4s linear forwards",
        "breathe-out": "breatheOut 4s ease-in-out forwards",
      },
      keyframes: {
        breatheIn: {
          "0%": { transform: "scale(0.6)" },
          "100%": { transform: "scale(1)" },
        },
        breatheHold: {
          "0%, 100%": { transform: "scale(1)" },
        },
        breatheOut: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2fbf5",
          100: "#daf2e2",
          200: "#b9e3c8",
          300: "#8fd0a8",
          500: "#2f8a57",
          600: "#256f46",
          700: "#1f5a3c",
          900: "#173629"
        },
        accent: {
          50: "#fffbea",
          100: "#fef1c7",
          500: "#cf9f2f",
          700: "#946c10"
        }
      },
      fontFamily: {
        body: ["'Trebuchet MS'", "'Segoe UI'", "sans-serif"],
        display: ["Georgia", "Cambria", "'Times New Roman'", "serif"]
      },
      boxShadow: {
        soft: "0 18px 45px -28px rgba(23, 54, 41, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;

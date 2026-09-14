import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: "#6D1223",
          dark: "#4E0C19",
          light: "#8A2036",
        },
        gold: {
          DEFAULT: "#D4A017",
          light: "#F5DFA3",
        },
        ink: "#1E1E1E",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

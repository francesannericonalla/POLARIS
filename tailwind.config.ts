import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: "#7A1428",
          dark: "#56101D",
          light: "#9A2035",
        },
        gold: {
          DEFAULT: "#E8B84B",
          light: "#FAF0D0",
        },
        ink: "#1E1E1E",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

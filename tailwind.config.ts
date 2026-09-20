import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        maroon: {
          DEFAULT: "#7A1330",
          dark: "#4A0E1F",
          darker: "#330916",
          deep: "#5E1228",
          light: "#8A2036",
        },
        gold: {
          DEFAULT: "#B8892B",
          light: "#E8C66E",
          warm: "#D9A43A",
          muted: "#9C6F1F",
        },
        cream: {
          DEFAULT: "#F7F3EC",
          warm: "#FFFCF7",
          muted: "#EADFCB",
        },
        ink: "#201A1D",
        teal: "#1F5C52",
      },
      fontFamily: {
        sans:    ["Manrope", "system-ui", "sans-serif"],
        poppins: ["Poppins", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

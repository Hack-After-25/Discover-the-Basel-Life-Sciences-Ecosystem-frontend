import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#123B7A", dark: "#0C2B5C", soft: "#E8EEF8" },
        accent: { DEFAULT: "#0E8F8A", dark: "#0A6E6A", soft: "#E1F4F2" },
        ink: "#14213D",
        muted: "#5A6781",
        line: "#DCE3EE",
        surface: "#F4F7FB",
      },
      fontFamily: {
        sans: ['"Schibsted Grotesk Variable"', "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18, 59, 122, 0.06), 0 6px 20px -12px rgba(18, 59, 122, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;

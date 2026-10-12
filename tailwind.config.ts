import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#0E2A5E", dark: "#0A1F47", soft: "#E9EEF8" },
        accent: { DEFAULT: "#0F766E", dark: "#0B5F58", soft: "#E3F3F1", bright: "#5EEAD4" },
        ink: "#0B1220",
        muted: "#566070",
        line: "#E4E7EC",
        surface: "#F5F6F8",
      },
      fontFamily: {
        sans: ['"Geist Variable"', "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ['"Geist Mono Variable"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 18, 32, 0.04)",
        lift: "0 1px 2px rgba(11, 18, 32, 0.06), 0 12px 32px -16px rgba(11, 18, 32, 0.18)",
        hero: "0 30px 60px -30px rgba(0, 0, 0, 0.6)",
        menu: "0 1px 2px rgba(11, 18, 32, 0.06), 0 18px 40px -12px rgba(11, 18, 32, 0.22)",
      },
      keyframes: {
        "menu-in": { from: { opacity: "0", transform: "translateY(-4px) scale(0.98)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        "menu-in": "menu-in 120ms ease-out",
      },
    },
  },
  plugins: [],
};
export default config;

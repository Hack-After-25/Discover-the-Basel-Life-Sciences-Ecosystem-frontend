import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#11120F", dark: "#11120F", soft: "#EEF0E8" },
        accent: { DEFAULT: "#2446F5", dark: "#1A35D1", soft: "#E9EDFE" },
        lime: "#D6FF3F",
        mist: "#EEF0E8",
        ink: "#11120F",
        muted: "#5C5F57",
        line: "#E2E4DB",
        surface: "#F6F7F2",
      },
      fontFamily: {
        sans: ['"Manrope Variable"', "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ['"Space Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
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

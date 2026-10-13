import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "rgb(var(--primary) / <alpha-value>)", dark: "rgb(var(--primary-dark) / <alpha-value>)", soft: "rgb(var(--primary-soft) / <alpha-value>)" },
        accent: { DEFAULT: "rgb(var(--accent) / <alpha-value>)", dark: "rgb(var(--accent-dark) / <alpha-value>)", soft: "rgb(var(--accent-soft) / <alpha-value>)" },
        "on-primary": "rgb(var(--on-primary) / <alpha-value>)",
        lime: "#D6FF3F",
        mist: "#EEF0E8",
        night: "#11120F",
        card: { DEFAULT: "rgb(var(--card) / <alpha-value>)", 2: "rgb(var(--card-2) / <alpha-value>)" },
        ink: { DEFAULT: "rgb(var(--ink) / <alpha-value>)", 2: "rgb(var(--ink-2) / <alpha-value>)", 3: "rgb(var(--ink-3) / <alpha-value>)" },
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        field: { DEFAULT: "rgb(var(--field) / <alpha-value>)", hover: "rgb(var(--field-hover) / <alpha-value>)" },
        subtle: "rgb(var(--subtle) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
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

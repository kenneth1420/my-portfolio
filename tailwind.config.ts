import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        surface: "var(--color-surface)",
        "text-dim": "var(--color-text-dim)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        gold: "var(--color-gold)",
        subtle: "var(--color-subtle)",
        card: "var(--color-card)",
      },
    },
  },
  plugins: [],
};

export default config;

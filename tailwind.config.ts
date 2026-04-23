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
        command: {
          bg: "var(--color-bg)",
          surface: "var(--color-surface)",
          primary: "var(--color-primary)",
          accent: "var(--color-accent)",
          text: "var(--color-text)",
          muted: "var(--color-muted)"
        }
      },
      boxShadow: {
        premium: "0 12px 40px rgba(4, 66, 41, 0.2)"
      },
      backgroundImage: {
        "field-gradient":
          "linear-gradient(165deg, rgba(4,66,41,0.96) 0%, rgba(3,41,29,0.98) 55%, rgba(2,25,18,1) 100%)"
      }
    }
  },
  plugins: []
};

export default config;

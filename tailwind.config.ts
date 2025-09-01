import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "var(--surface)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        "plan-entry": "var(--plan-entry)",
        "plan-grow": "var(--plan-grow)",
        "plan-custom": "var(--plan-custom)",
      },
      backgroundImage: {
        "wash-1": "var(--wash-1)",
        "wash-2": "var(--wash-2)",
        "accent-grad": "var(--accent-grad)",
      },
      boxShadow: {
        custom: "var(--shadow)",
      },
      borderRadius: {
        custom: "var(--radius)",
      },
      fontFamily: {
        sans: ["Sansation", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

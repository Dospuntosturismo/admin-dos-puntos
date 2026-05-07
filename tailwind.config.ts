import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        mist: "#f5f7f8",
        moss: "#587568",
        coral: "#d86b52",
        saffron: "#e1a82f",
        'dos-puntos-pink': '#B13463',
        'dos-puntos-gray': '#1C2544',
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 38, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;

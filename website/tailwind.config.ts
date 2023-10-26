import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: "#08121f",
      white: "#efefef",
      gray: "#3c3c3c",
      purple: "#6D60C1",
      lavender: "#A6A6E2",
      custard: "#F7F1AA",
      "blue-green": "#008E93",
      "dull-blue-green": "#C4DDDC",
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: "#08121f",
      white: "#efefef",
      "wai-gray": "#3c3c3c",
      purple: "#6D60C1",
      lavender: "#A6A6E2",
      custard: "#F7F1AA",
      "blue-green": "#008E93",
      "dull-blue-green": "#C4DDDC",
    },
    extend: {
      keyframes: {
        colourPulse: {
          "0%, 100%": {
            "stop-color": "#3c3c3c",
          },
          "50%": { "stop-color": "#6D60C1" },
        },
      },
      animation: {
        colourPulse: "colourPulse 10s ease-in-out infinite",
        colourPulseOffset: "colourPulse 10s ease-in-out infinite -5s",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: "#08121f",
      white: "#efefef",
      "pure-white": "#ffffff",
      "wai-gray": "#3c3c3c",
      purple: "#6D60C1",
      lavender: "#A6A6E2",
      custard: "#F7F1AA",
      "blue-green": "#008E93",
      "dull-blue-green": "#C4DDDC",
    },
    extend: {
      dropShadow: {
        "sm-wai-gray": "0 1px 1px rgba(60, 60, 60, 0.25)",
        "lg-wai-gray": "0 20px 13px rgba(60, 60, 60, 0.25)",
      },
      keyframes: {
        colourPulse: {
          "0%, 100%": {
            "stop-color": "#3c3c3c",
          },
          "50%": { "stop-color": "#6D60C1" },
        },
        text: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
      animation: {
        colourPulse: "colourPulse 10s ease-in-out infinite",
        colourPulseOffset: "colourPulse 10s ease-in-out infinite -5s",
        text: "text 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;

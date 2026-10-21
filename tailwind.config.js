/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        socare: {
          blue: "#0089e4",
          red: "#ef4444",
          dark: "#192730",
          navy: "#0f172a",
          light: "#f6f6f8",
          border: "#ecedef",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0, 137, 228, 0.35)" },
          "50%": { boxShadow: "0 0 24px 6px rgba(0, 137, 228, 0.2)" },
        },
      },
      animation: {
        float: "float 4.5s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

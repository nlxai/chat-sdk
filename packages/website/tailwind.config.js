/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["'Inter'", "sans-serif"],
      mono: ["'Space Mono'", "monospace"],
      serif: ["Times", "serif"]
    },
    extend: {
      maxWidth: {
        "8xl": "88rem"
      }
    }
  },
  plugins: []
};

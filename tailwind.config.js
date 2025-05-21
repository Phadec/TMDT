/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.jsx"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3f51b5",
          light: "#757de8",
          dark: "#002984",
        },
        secondary: {
          DEFAULT: "#ff4081",
          light: "#ff79b0",
          dark: "#c60055",
        },
        content: {
          DEFAULT: "#212121",
          primary: "#212121",
          secondary: "#757575",
        },
        surface: {
          DEFAULT: "#f8f9fa",
          light: "#f8f9fa",
          white: "#ffffff",
        },
        border: "#e0e0e0",
        success: "#4caf50",
        info: "#2196f3",
        warning: "#ff9800",
        danger: "#f44336",
      },
      boxShadow: {
        DEFAULT: "0 2px 10px rgba(0, 0, 0, 0.08)",
        md: "0 4px 15px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        DEFAULT: "8px",
        full: "9999px",
      },
      transitionDuration: {
        DEFAULT: "250ms",
        fast: "150ms",
        slow: "400ms",
      },
      fontFamily: {
        sans: ["Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

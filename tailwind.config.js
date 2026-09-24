/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          "sans-serif",
        ],
        mono: [
          '"SF Mono"',
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      colors: {
        neu: {
          bg: "#e0e5ec",
          raised: "#f0f0f3",
          dark: "#b8bcc2",
          light: "#ffffff",
          accent: "#6d5dfc",
        },
      },
      boxShadow: {
        "neu-flat": "8px 8px 16px #b8bcc2, -8px -8px 16px #ffffff",
        "neu-flat-sm": "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff",
        "neu-flat-md": "6px 6px 12px #b8bcc2, -6px -6px 12px #ffffff",
        "neu-flat-lg": "12px 12px 24px #b8bcc2, -12px -12px 24px #ffffff",
        "neu-inset": "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff",
        "neu-inset-sm": "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
        "neu-inset-md": "inset 6px 6px 12px #b8bcc2, inset -6px -6px 12px #ffffff",
      },
    },
  },
  plugins: [],
}

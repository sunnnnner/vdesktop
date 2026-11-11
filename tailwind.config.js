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
          '"Roboto Mono"',
          "monospace",
        ],
      },
      colors: {
        // Ant Design + Material Design 3 融合色盘
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#1677ff", // Ant Design 5 核心品牌蓝
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        surface: {
          page: "#f8fafc",          // 现代浅灰蓝背景 (Slate 50)
          card: "#ffffff",          // 纯白主卡片 Surface
          subtle: "#f1f5f9",        // 次级表面容器 (Slate 100)
          muted: "#e2e8f0",         // 边框与分割 (Slate 200)
        },
      },
      boxShadow: {
        // M3 层次光影与 Ant Design 精细浮层阴影融合
        "m3-elevated-1": "0 1px 2px 0 rgba(15, 23, 42, 0.05), 0 1px 3px 1px rgba(15, 23, 42, 0.03)",
        "m3-elevated-2": "0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)",
        "m3-elevated-3": "0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)",
        "ant-card": "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
        "ant-dropdown": "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        "m3-pill": "9999px",
        "m3-card": "16px",
        "ant-sm": "6px",
        "ant-base": "8px",
      },
    },
  },
  plugins: [],
};

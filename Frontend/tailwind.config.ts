import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Zoho-inspired corporate palette
        navy: {
          DEFAULT: "#17324D",
          50: "#F7F8FA",
          100: "#E5E7EB",
          200: "#C9CED5",
          300: "#9AA3AF",
          400: "#60656D",
          500: "#2463A6",
          600: "#1E5289",
          700: "#17324D",
          800: "#12263A",
          900: "#0C1926",
          950: "#060D14",
        },
        corporate: {
          blue: "#2463A6",
          "blue-hover": "#1E5289",
          "blue-secondary": "#2D77C7",
          "blue-light": "#F0F5FA",
          navy: "#17324D",
          dark: "#1C1C1C",
          secondary: "#60656D",
          light: "#F7F8FA",
          border: "#E5E7EB",
        },
        brandText: {
          dark: "#1C1C1C",
          secondary: "#60656D",
          muted: "#8A92A0",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F7F8FA",
          card: "#FFFFFF",
          border: "#E5E7EB",
        },
      },
      borderRadius: {
        subtle: "4px",
        corporate: "6px",
      },
      fontFamily: {
        sans: [
          '"Zoho Puvi"',
          "var(--font-zoho-puvi)",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        corporate: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "corporate-md": "0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)",
        "corporate-lg": "0 10px 24px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
      },
    },
  },
  plugins: [],
};
export default config;

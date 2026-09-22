/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Ledger palette — deliberately overrides Tailwind's stock gray/blue/green/red
        // shades so the whole app (which leans on literal utility classes like
        // bg-gray-900 or text-blue-400) inherits the new identity everywhere at once.
        gray: {
          50: "#F5F2EA",
          100: "#ECEFF2",
          200: "#D8DEE4",
          300: "#B8C2CC",
          400: "#93A0AE",
          500: "#6B7684",
          600: "#4A5462",
          700: "#2A323D",
          800: "#1B222C",
          900: "#10151C",
          950: "#0A0D12",
        },
        blue: {
          50: "#FBF3E3",
          100: "#F3E2BE",
          200: "#E9CD93",
          300: "#E6CB93",
          400: "#D9B268",
          500: "#C99A46",
          600: "#B8862F",
          700: "#8F6A26",
          800: "#6B4F1D",
          900: "#4A3714",
          950: "#2E2209",
        },
        gold: {
          DEFAULT: "#C99A46",
          light: "#D9B268",
          dark: "#B8862F",
        },
        green: {
          50: "#EAF7EF",
          100: "#D8EFE1",
          200: "#B4E1C6",
          300: "#8AD0A9",
          400: "#5CBE8C",
          500: "#3FA972",
          600: "#2F8C5C",
          700: "#256F49",
          800: "#1C5237",
          900: "#14301F",
          950: "#0B1D13",
        },
        red: {
          50: "#FBEDEA",
          100: "#F7DEDA",
          200: "#EFBFB6",
          300: "#E8A79D",
          400: "#E08476",
          500: "#D1554A",
          600: "#B8402F",
          700: "#8F3327",
          800: "#5C1F19",
          900: "#3D1512",
          950: "#240D0B",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "draw-line": {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "draw-line": "draw-line 1.8s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

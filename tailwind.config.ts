import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // <--- අන්න මේක තමයි Dark Mode එක වැඩ කිරීමට අත්‍යවශ්‍ය වන්නේ!
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
};

export default config;
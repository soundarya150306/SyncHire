/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0c', // Deep charcoal/black
                surface: '#131316',    // Slightly lighter for cards
                primary: {
                    DEFAULT: '#3b82f6', // Electric blue
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    glow: '#60a5fa80', // For glow effects
                },
                secondary: {
                    DEFAULT: '#6366f1', // Indigo
                    glow: '#818cf880',
                },
                accent: '#8b5cf6', // Violet
                glass: {
                    10: 'rgba(255, 255, 255, 0.03)',
                    20: 'rgba(255, 255, 255, 0.05)',
                    30: 'rgba(255, 255, 255, 0.1)',
                },
                border: 'rgba(255, 255, 255, 0.08)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px -5px var(--tw-shadow-color)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(to bottom right, #0a0a0c, #131316)',
            }
        },
    },
    plugins: [],
}

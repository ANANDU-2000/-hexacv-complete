/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Premium Black & White SaaS Design System
                'bw': {
                    'black': '#000000',
                    'white': '#FFFFFF',
                    'surface': '#F5F5F5',
                    'border': '#E0E0E0',
                    'accent': '#1D4ED8',
                    'gray': {
                        100: '#F5F5F5',
                        200: '#E5E5E5',
                        300: '#D4D4D4',
                        400: '#A3A3A3',
                        500: '#737373',
                        600: '#525252',
                        700: '#404040',
                        800: '#262626',
                        900: '#171717',
                    }
                },
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
            },
            borderRadius: {
                'bw-input': '8px',
                'bw-card': '10px',
                'bw-modal': '12px',
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            boxShadow: {
                'bw-soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
                'bw-card': '0 4px 16px rgba(0, 0, 0, 0.06)',
                'bw-hover': '0 8px 24px rgba(0, 0, 0, 0.10)',
                'bw-modal': '0 16px 48px rgba(0, 0, 0, 0.12)',
            },
            transitionTimingFunction: {
                'bw-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            transitionDuration: {
                'bw': '280ms',
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "bw-fade-in": {
                    from: { opacity: "0", transform: "translateY(-8px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "bw-fade-up": {
                    from: { opacity: "0", transform: "translateY(16px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "bw-slide-in-right": {
                    from: { opacity: "0", transform: "translateX(24px)" },
                    to: { opacity: "1", transform: "translateX(0)" },
                },
                "bw-pulse-subtle": {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.85" },
                },
                "bw-toast-in": {
                    from: { opacity: "0", transform: "translateY(-100%)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "shake": {
                    "0%, 100%": { transform: "translateX(0)" },
                    "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
                    "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "bw-fade-in": "bw-fade-in 280ms cubic-bezier(0.4, 0, 0.2, 1)",
                "bw-fade-up": "bw-fade-up 320ms cubic-bezier(0.4, 0, 0.2, 1)",
                "bw-slide-in-right": "bw-slide-in-right 320ms cubic-bezier(0.4, 0, 0.2, 1)",
                "bw-pulse-subtle": "bw-pulse-subtle 2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                "bw-toast-in": "bw-toast-in 280ms cubic-bezier(0.4, 0, 0.2, 1)",
                "shake": "shake 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}

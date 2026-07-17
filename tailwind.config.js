/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                ui: {
                    background: "#FFFFFF", // Pure white for max contrast
                    surface: "#F9FAFB", // Slight separation layer
                    accent: "#2563EB", // Stronger blue (Blue 600)
                    secondary: "#4F46E5", // Indigo 600
                    highlight: "#059669", // Emerald 600
                    neutral: "#D1D5DB", // Gray 300 (clear borders)
                },
                content: {
                    primary: "#020617", // Almost black (stronger than slate)
                    secondary: "#374151", // Gray 700 (better readability)
                    muted: "#6B7280", // Gray 500 (still readable)
                },
            },
            fontFamily: {
                sans: ["Inter", "ui-sans-serif", "system-ui"],
                rounded: ["Nunito", "sans-serif"],
            },
            borderRadius: {
                layout: "10px", // slightly tighter = sharper UI
            },
        },
    },
    plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            // 1. Adding 5 Custom Colors
            colors: {
                // Your Custom Purple Dark Theme
                ui: {
                    background: "#13111C", // Purple-Black
                    surface: "#1E1B29", // Purple-Gray
                    accent: "#8B5CF6", // Purple 500
                    secondary: "#EC4899", // Pink 500
                    highlight: "#06B6D4", // Cyan 500
                },
                // Dedicated text colors for better hierarchy
                content: {
                    primary: "#FAF5FF", // Purple 50
                    secondary: "#C4B5FD", // Purple 300
                },
            },
            // 2. Adding 2 Custom Font Families
            fontFamily: {
                sans: ["Nunito", "ui-sans-serif", "system-ui"],
                rounded: ["Quicksand", "sans-serif"],
            },
        },
    },
    plugins: [],
};

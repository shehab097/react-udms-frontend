import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
    plugins: [react(),
        // basicSsl()
    ],
    server: {
        // https: true,
        // host: true, // এটি আপনার নেটওয়ার্কের অন্য ডিভাইস (মোবাইল) থেকে অ্যাক্সেস সহজ করবে
        // port: 5173,
    },
});

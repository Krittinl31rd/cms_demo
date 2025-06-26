import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // https: {
    //   key: fs.readFileSync(
    //     path.resolve(
    //       __dirname,
    //       "/archismartsolution.com_rapidssl wildcard/privateKey.key"
    //     )
    //   ),
    //   cert: fs.readFileSync(
    //     path.resolve(
    //       __dirname,
    //       "/archismartsolution.com_rapidssl wildcard/_.archismartsolution.com.pem"
    //     )
    //   ),
    // },
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://192.168.1.66:5000",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
});

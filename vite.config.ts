import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/local-json-beautifier/" : "/",
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 12626,
  },
}));

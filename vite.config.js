import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  plugins: [glsl()],
  build: {
    outDir: resolve(__dirname, "build"),
    rollupOptions: {
      output: {
        manualChunks: {
          threejs: ["three"],
        },
        vendor: (id) => {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js'
      },
    },
  },
});

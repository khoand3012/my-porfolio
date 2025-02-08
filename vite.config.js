import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  plugins: [glsl()],
  build: {
    outDir: resolve(__dirname, "build"),
  },
});

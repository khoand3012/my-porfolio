import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  site: "https://khoa-nguyen-homepage.vercel.app",
  outDir: "build",
  vite: {
    plugins: [tailwindcss(), glsl()],
  },
});

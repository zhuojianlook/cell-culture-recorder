import { defineConfig } from "vite";

// The Cell Culture Recorder is built as a sub-app served under web/ccr/ inside
// the integrated WetLab Planner desktop bundle. A relative base makes its hashed
// assets load correctly from that sub-path (and still works standalone).
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});

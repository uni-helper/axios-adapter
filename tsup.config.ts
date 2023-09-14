import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: process.env.NODE_ENV === "production",
  external: ["axios"],
  dts: true,
});

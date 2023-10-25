import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/vite.ts', 'src/webpack.ts'],
  format: ['cjs', 'esm'],
  splitting: true,
  clean: true,
  treeshake: true,
  external: ['axios'],
  dts: true,
})

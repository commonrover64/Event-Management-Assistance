import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // shared ships raw TS, so it must be bundled in rather than left as an import
  noExternal: ['@xperience/shared'],
});

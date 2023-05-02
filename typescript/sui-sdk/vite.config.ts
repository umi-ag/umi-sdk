import { nodeResolve } from '@rollup/plugin-node-resolve';
import path from 'path';
import polyfillNode from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
    nodeResolve(),
    polyfillNode(),
  ],
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
    },
  },
  define: {
    'process.env': process.env ?? {},
  },
  build: {
    target: 'esnext',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'umd'],
      name: '@umi-ag/sui-sdk',
      fileName: (format) => {
        if (format === 'es') {
          return 'index.mjs';
        } else if (format === 'umd') {
          return 'index.js';
        }
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
});

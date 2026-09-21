import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  base: process.env.BASE_PATH || '/Test-Your-CK/',
  build: { target: 'es2020', sourcemap: false }
});

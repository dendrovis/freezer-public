import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  root: 'src/ui',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: '../../build',
    rollupOptions: {
      input: 'src/ui/index.html',
    },
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
});

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        // 主进程入口
        entry: 'src/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      {
        // 预加载脚本入口
        entry: 'src/preload.ts',
        onstart(args) {
          // 预加载脚本变更时通知渲染进程重载
          args.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  build: {
    // 渲染进程输出目录
    outDir: 'dist',
  },
});

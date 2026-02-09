# Copilot Instructions — qian

## 架构概览

基于 **Electron + Vue 3 + Naive UI** 的桌面应用，使用 **Electron Forge** 脚手架 + **Vite** 构建。

### 进程模型（3 个入口）

| 入口 | 文件 | Vite 配置 | 运行环境 |
|---|---|---|---|
| 主进程 | `src/main.ts` | `vite.main.config.ts` | Node.js |
| 预加载 | `src/preload.ts` | `vite.preload.config.ts` | main ↔ renderer 桥接 |
| 渲染进程 | `src/renderer.ts` | `vite.renderer.config.ts` | 浏览器（Vue 应用） |

- **主进程** (`src/main.ts`)：创建 `BrowserWindow`，管理应用生命周期。使用 `MAIN_WINDOW_VITE_DEV_SERVER_URL` / `MAIN_WINDOW_VITE_NAME` 全局变量（由 `@electron-forge/plugin-vite` 注入）。
- **渲染进程** (`src/renderer.ts`)：引导 Vue 3 应用，通过 `app.use(naive)` 全局注册 Naive UI，挂载到 `index.html` 的 `#app`。
- **预加载脚本** (`src/preload.ts`)：目前为空。添加 IPC API 时在此使用 `contextBridge.exposeInMainWorld()`。

## 编码规范

### Vue 与 TypeScript
- **Vue 风格**：统一使用 `<script setup lang="ts">` + Composition API，禁止 Options API。
- **TypeScript**：严格模式（`noImplicitAny: true`）。Vue SFC 类型声明在 `src/env.d.ts`；Forge/Vite 全局类型在 `forge.env.d.ts`。
- **CSS**：全局 reset 在 `src/index.css`；组件样式使用 `<style scoped>`。
- **UI 语言**：所有界面文本使用 **简体中文**。

### Naive UI 使用原则

**优先使用 Naive UI 组件的原生能力，避免手写 CSS 或自行实现已有的组件功能。** 官方文档：https://www.naiveui.com/zh-CN/os-theme/docs/introduction

具体要求：
- 所有 `<n-*>` 组件已全局注册，直接在模板中使用，无需逐个导入。
- **布局**：使用 `<n-layout>` / `<n-space>` / `<n-grid>` 组织页面结构，不要手写 flex/grid CSS 来实现已有的布局效果。
- **主题**：通过 `<n-config-provider :theme="...">` + `<n-global-style />` 管理明暗主题切换（参见 `src/App.vue` 的现有实现），用 `theme-overrides` 自定义设计令牌，不要直接覆写 CSS 变量。
- **反馈类**：弹窗用 `<n-modal>` / `<n-dialog>`、通知用 `<n-notification>`、轻提示用 `<n-message>`，不要自己实现弹出层。
- **表单**：使用 `<n-form>` + `<n-form-item>` 的内置校验（`rules` prop），不要手写校验逻辑。
- **数据展示**：表格用 `<n-data-table>`（支持排序、筛选、分页），不要自己写 `<table>`。
- **样式微调**：优先利用组件 props（如 `size`、`type`、`bordered`、`style`）和 `theme-overrides` 调整样式，仅在组件能力不足时才写 scoped CSS。

## 开发命令

```bash
npm run start      # 开发模式，支持热更新（electron-forge + vite）
npm run package    # 打包应用（无安装包）
npm run make       # 构建分发安装包（squirrel/zip/deb/rpm）
npm run lint       # ESLint 检查 .ts/.tsx 文件
```

- 暂未配置测试框架。
- Forge 配置在 `forge.config.ts`，包含 makers 与 plugins 定义。
- 生产构建启用 ASAR 打包；Fuses 已配置安全选项（禁用 `RunAsNode`、开启 Cookie 加密等）。

## 添加新功能

1. **新页面/组件**：在 `src/` 下创建，在 `App.vue` 中引入或配置 vue-router。
2. **IPC 通信**：在 `src/main.ts` 定义 `ipcMain.handle` 处理函数，在 `src/preload.ts` 通过 `contextBridge` 暴露 API，渲染进程通过 `window.electronAPI.*` 调用。
3. **Vite 配置变更**：渲染进程配置在 `vite.renderer.config.ts`（含 `@vitejs/plugin-vue`）；主进程/预加载配置独立且较简单。

## 技术栈版本

- **运行时**：Vue 3.x、Naive UI 2.x、`electron-squirrel-startup`
- **构建工具**：Electron 40、Electron Forge 7、Vite 5、TypeScript 5、`@vitejs/plugin-vue` 4

import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'node:path';
import { loadConfig, saveConfig } from './config';
import {
  setFormaConfig,
  ensureSchemas,
  loadProjects,
  createProject,
  updateProject as formaUpdateProject,
  deleteProject as formaDeleteProject,
  loadCards,
  createCard,
  loadGrain,
  saveGrain,
  clearGrain,
} from './formaClient';

// ── IPC Handlers ─────────────────────────────────────────
function registerIPC() {
  // ── 配置管理 ──
  ipcMain.handle('config:load', async () => {
    return await loadConfig();
  });

  ipcMain.handle('config:save', async (_e, config) => {
    await saveConfig(config);
    setFormaConfig(config);
  });

  // ── Schema 初始化 ──
  ipcMain.handle('forma:ensure-schemas', async () => {
    await ensureSchemas();
  });

  // ── Project CRUD ──
  ipcMain.handle('forma:project-list', async () => {
    return await loadProjects();
  });

  ipcMain.handle('forma:project-create', async (_e, data) => {
    return await createProject(data);
  });

  ipcMain.handle('forma:project-update', async (_e, id: string, currentProject, changes) => {
    await formaUpdateProject(id, currentProject, changes);
  });

  ipcMain.handle('forma:project-delete', async (_e, id: string) => {
    await formaDeleteProject(id);
  });

  // ── Card CRUD ──
  ipcMain.handle('forma:card-list', async () => {
    return await loadCards();
  });

  ipcMain.handle('forma:card-create', async (_e, data) => {
    return await createCard(data);
  });

  // ── Grain（单例） ──
  ipcMain.handle('forma:grain-load', async () => {
    return await loadGrain();
  });

  ipcMain.handle('forma:grain-save', async (_e, grain) => {
    return await saveGrain(grain);
  });

  ipcMain.handle('forma:grain-clear', async () => {
    await clearGrain();
  });
}

// ── 窗口创建 ─────────────────────────────────────────────
const createWindow = () => {
  // 隐藏菜单栏
  Menu.setApplicationMenu(null);

  const mainWindow = new BrowserWindow({
    title: 'Qian',
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

// ── 生命周期 ─────────────────────────────────────────────
app.on('ready', async () => {
  // 启动时加载配置并注入到 formaClient
  const config = await loadConfig();
  setFormaConfig(config);

  registerIPC();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

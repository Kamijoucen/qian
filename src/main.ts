import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';

// ── 数据目录 ──────────────────────────────────────────────
const DATA_DIR = path.join(app.getPath('home'), 'qian-data');
const PROJECTS_PATH = path.join(DATA_DIR, 'projects.json');
const CARDS_PATH = path.join(DATA_DIR, 'cards.json');
const GRAIN_PATH = path.join(DATA_DIR, 'grain.json');

/** 安全读取 JSON 文件，文件不存在时返回 fallback */
async function readJSON<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** 写入 JSON 文件 */
async function writeJSON(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ── IPC Handlers ─────────────────────────────────────────
function registerIPC() {
  ipcMain.handle('data:load-projects', () => readJSON(PROJECTS_PATH, []));
  ipcMain.handle('data:save-projects', (_e, projects) => writeJSON(PROJECTS_PATH, projects));

  ipcMain.handle('data:load-cards', () => readJSON(CARDS_PATH, []));
  ipcMain.handle('data:save-cards', (_e, cards) => writeJSON(CARDS_PATH, cards));

  ipcMain.handle('data:load-grain', () => readJSON(GRAIN_PATH, null));
  ipcMain.handle('data:save-grain', (_e, grain) => writeJSON(GRAIN_PATH, grain));

  // 导出 Markdown 周报
  ipcMain.handle('data:export-report', async () => {
    const projects = await readJSON<Array<{ id: string; name: string }>>(PROJECTS_PATH, []);
    const cards = await readJSON<Array<{ projectId: string; nextAction: string; target: string; checkpoint: string; createdAt: string }>>(CARDS_PATH, []);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentCards = cards.filter((c) => new Date(c.createdAt) >= weekAgo);

    const projectMap = new Map(projects.map((p) => [p.id, p.name]));
    const grouped = new Map<string, typeof recentCards>();
    for (const card of recentCards) {
      const name = projectMap.get(card.projectId) ?? '未知课题';
      if (!grouped.has(name)) grouped.set(name, []);
      grouped.get(name)!.push(card);
    }

    const dateStr = now.toISOString().slice(0, 10);
    let md = `# Qian 周报 — ${dateStr}\n\n`;

    if (grouped.size === 0) {
      md += '本周暂无学习记录。\n';
    } else {
      for (const [name, list] of grouped) {
        md += `## ${name}\n\n`;
        for (const card of list) {
          md += `- **下一步**: ${card.nextAction || '—'}\n`;
          md += `  - 目标: ${card.target || '—'}\n`;
          md += `  - 停在: ${card.checkpoint || '—'}\n`;
          md += `  - 时间: ${card.createdAt.slice(0, 10)}\n\n`;
        }
      }
    }

    const reportPath = path.join(DATA_DIR, `weekly-report-${dateStr}.md`);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(reportPath, md, 'utf-8');
    return reportPath;
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
app.on('ready', () => {
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

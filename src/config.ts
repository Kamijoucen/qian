/**
 * Forma 连接配置管理 — 运行在主进程。
 * 配置持久化到 ~/qian-data/forma-config.json。
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import { app } from 'electron';
import type { FormaConfig } from './types';

const DATA_DIR = path.join(app.getPath('home'), 'qian-data');
const CONFIG_PATH = path.join(DATA_DIR, 'forma-config.json');

const DEFAULT_CONFIG: FormaConfig = {
  baseUrl: 'http://localhost:8888/api',
  token: '',
};

export async function loadConfig(): Promise<FormaConfig> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
    const data = JSON.parse(raw) as Partial<FormaConfig>;
    return {
      baseUrl: data.baseUrl || DEFAULT_CONFIG.baseUrl,
      token: data.token || DEFAULT_CONFIG.token,
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: FormaConfig): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

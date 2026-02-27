// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // ── 配置管理 ──
  loadConfig: () => ipcRenderer.invoke('config:load'),
  saveConfig: (config: unknown) => ipcRenderer.invoke('config:save', config),

  // ── Schema 初始化 ──
  ensureSchemas: () => ipcRenderer.invoke('forma:ensure-schemas'),

  // ── Project CRUD ──
  loadProjects: () => ipcRenderer.invoke('forma:project-list'),
  createProject: (data: unknown) => ipcRenderer.invoke('forma:project-create', data),
  updateProject: (id: string, currentProject: unknown, changes: unknown) =>
    ipcRenderer.invoke('forma:project-update', id, currentProject, changes),
  deleteProject: (id: string) => ipcRenderer.invoke('forma:project-delete', id),

  // ── Card CRUD ──
  loadCards: () => ipcRenderer.invoke('forma:card-list'),
  createCard: (data: unknown) => ipcRenderer.invoke('forma:card-create', data),

  // ── Grain（单例） ──
  loadGrain: () => ipcRenderer.invoke('forma:grain-load'),
  saveGrain: (grain: unknown) => ipcRenderer.invoke('forma:grain-save', grain),
  clearGrain: () => ipcRenderer.invoke('forma:grain-clear'),
});

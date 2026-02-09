// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  loadProjects: () => ipcRenderer.invoke('data:load-projects'),
  saveProjects: (projects: unknown) => ipcRenderer.invoke('data:save-projects', projects),
  loadCards: () => ipcRenderer.invoke('data:load-cards'),
  saveCards: (cards: unknown) => ipcRenderer.invoke('data:save-cards', cards),
  loadGrain: () => ipcRenderer.invoke('data:load-grain'),
  saveGrain: (grain: unknown) => ipcRenderer.invoke('data:save-grain', grain),
  exportReport: () => ipcRenderer.invoke('data:export-report'),
});

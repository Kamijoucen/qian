import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Project } from '../types';

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([]);

  const activeProjects = computed(() =>
    projects.value.filter((p) => p.status === 'active'),
  );

  /** 从本地文件加载 */
  async function loadAll() {
    projects.value = await window.electronAPI.loadProjects();
  }

  /** 持久化到本地文件（剥离响应式 Proxy 再传 IPC） */
  async function saveAll() {
    const raw = JSON.parse(JSON.stringify(projects.value));
    await window.electronAPI.saveProjects(raw);
  }

  /** 添加课题 */
  async function addProject(data: { name: string; color: string; progress?: string }) {
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      name: data.name,
      color: data.color,
      status: 'active',
      progress: data.progress ?? '',
      drawHistory: [],
      createdAt: now,
      updatedAt: now,
    };
    projects.value.push(project);
    await saveAll();
    return project;
  }

  /** 更新课题 */
  async function updateProject(id: string, data: Partial<Pick<Project, 'name' | 'color' | 'progress' | 'status'>>) {
    const idx = projects.value.findIndex((p) => p.id === id);
    if (idx === -1) return;
    Object.assign(projects.value[idx], data, { updatedAt: new Date().toISOString() });
    await saveAll();
  }

  /** 归档课题 */
  async function archiveProject(id: string) {
    await updateProject(id, { status: 'archived' });
  }

  /** 删除课题 */
  async function deleteProject(id: string) {
    projects.value = projects.value.filter((p) => p.id !== id);
    await saveAll();
  }

  /** 抽签：从 active 课题中随机选取一个 */
  async function drawRandom(): Promise<Project | null> {
    const pool = activeProjects.value;
    if (pool.length === 0) return null;
    const idx = Math.floor(Math.random() * pool.length);
    const chosen = pool[idx];
    chosen.drawHistory.push(new Date().toISOString());
    chosen.updatedAt = new Date().toISOString();
    await saveAll();
    return chosen;
  }

  /** 根据 id 获取课题 */
  function getProject(id: string): Project | undefined {
    return projects.value.find((p) => p.id === id);
  }

  return {
    projects,
    activeProjects,
    loadAll,
    saveAll,
    addProject,
    updateProject,
    archiveProject,
    deleteProject,
    drawRandom,
    getProject,
  };
});

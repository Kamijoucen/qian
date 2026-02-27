import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Project } from '../types';

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([]);

  const activeProjects = computed(() =>
    projects.value.filter((p) => p.status === 'active'),
  );

  /** 从 Forma 加载所有课题 */
  async function loadAll() {
    projects.value = await window.electronAPI.loadProjects();
  }

  /** 添加课题 */
  async function addProject(data: { name: string; color: string; progress?: string }) {
    const project = await window.electronAPI.createProject(data);
    projects.value.push(project);
    return project;
  }

  /** 更新课题 */
  async function updateProject(id: string, data: Partial<Pick<Project, 'name' | 'color' | 'progress' | 'status' | 'drawHistory'>>) {
    const idx = projects.value.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const current = JSON.parse(JSON.stringify(projects.value[idx])) as Project;
    await window.electronAPI.updateProject(id, current, data);
    // 本地同步更新
    Object.assign(projects.value[idx], data, { updatedAt: new Date().toISOString() });
  }

  /** 归档课题 */
  async function archiveProject(id: string) {
    await updateProject(id, { status: 'archived' });
  }

  /** 删除课题 */
  async function deleteProject(id: string) {
    await window.electronAPI.deleteProject(id);
    projects.value = projects.value.filter((p) => p.id !== id);
  }

  /** 抽签：从 active 课题中随机选取一个 */
  async function drawRandom(): Promise<Project | null> {
    const pool = activeProjects.value;
    if (pool.length === 0) return null;
    const idx = Math.floor(Math.random() * pool.length);
    const chosen = pool[idx];
    const newHistory = [...chosen.drawHistory, new Date().toISOString()];
    await updateProject(chosen.id, { drawHistory: newHistory });
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
    addProject,
    updateProject,
    archiveProject,
    deleteProject,
    drawRandom,
    getProject,
  };
});

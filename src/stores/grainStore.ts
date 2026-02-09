import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Grain } from '../types';

export const useGrainStore = defineStore('grain', () => {
  const grain = ref<Grain | null>(null);

  /** grain 是否处于有效锁定状态 */
  const isActive = computed(() => {
    if (!grain.value || !grain.value.confirmed) return false;
    const start = new Date(grain.value.startTime).getTime();
    const end = start + grain.value.durationDays * 24 * 60 * 60 * 1000;
    return Date.now() < end;
  });

  /** 剩余时间文案 */
  const remainingText = computed(() => {
    if (!grain.value || !grain.value.confirmed) return '';
    const start = new Date(grain.value.startTime).getTime();
    const end = start + grain.value.durationDays * 24 * 60 * 60 * 1000;
    const remaining = end - Date.now();
    if (remaining <= 0) return '已到期';
    const hours = Math.ceil(remaining / (1000 * 60 * 60));
    if (hours <= 24) return `还剩 ${hours} 小时`;
    const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    return `还剩 ${days} 天`;
  });

  /** 从本地文件加载 */
  async function load() {
    grain.value = await window.electronAPI.loadGrain();
  }

  /** 持久化（剥离响应式 Proxy 再传 IPC） */
  async function save() {
    const raw = grain.value ? JSON.parse(JSON.stringify(grain.value)) : null;
    await window.electronAPI.saveGrain(raw);
  }

  /** 确认抽签结果，创建 grain */
  async function confirm(projectId: string, durationDays: number) {
    grain.value = {
      projectId,
      startTime: new Date().toISOString(),
      durationDays,
      confirmed: true,
    };
    await save();
  }

  /** 清除 grain（过期或手动） */
  async function clear() {
    grain.value = null;
    await save();
  }

  return { grain, isActive, remainingText, load, save, confirm, clear };
});

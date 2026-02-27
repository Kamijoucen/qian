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

  /** 从 Forma 加载 Grain（单例） */
  async function load() {
    grain.value = await window.electronAPI.loadGrain();
  }

  /** 确认抽签结果，创建/更新 grain */
  async function confirm(projectId: string, durationDays: number) {
    const result = await window.electronAPI.saveGrain({
      projectId,
      startTime: new Date().toISOString(),
      durationDays,
      confirmed: true,
    });
    grain.value = result;
  }

  /** 清除 grain（过期或手动） */
  async function clear() {
    await window.electronAPI.clearGrain();
    grain.value = null;
  }

  return { grain, isActive, remainingText, load, confirm, clear };
});

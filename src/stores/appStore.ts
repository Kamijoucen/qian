import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AppView } from '../types';
import { useGrainStore } from './grainStore';

export const useAppStore = defineStore('app', () => {
  const currentView = ref<AppView>(AppView.IDLE);
  /** 进入 MANAGE 之前的视图，用于返回 */
  const previousView = ref<AppView>(AppView.IDLE);
  /** 当前抽中的课题 ID（抽签后设置，避免反推） */
  const drawnProjectId = ref<string | null>(null);

  function switchTo(view: AppView) {
    if (view === AppView.MANAGE) {
      previousView.value = currentView.value;
    }
    currentView.value = view;
  }

  /** 返回管理页之前的视图 */
  function goBack() {
    currentView.value = previousView.value;
  }

  /** 应用启动时调用：检查 grain 决定初始视图 */
  async function init() {
    const grainStore = useGrainStore();
    await grainStore.load();

    if (grainStore.isActive) {
      currentView.value = AppView.ACTIVE;
    } else {
      // grain 过期或不存在 → 清除并回到抽签页
      if (grainStore.grain) {
        await grainStore.clear();
      }
      currentView.value = AppView.IDLE;
    }
  }

  return { currentView, previousView, drawnProjectId, switchTo, goBack, init };
});

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AppView } from '../types';
import { useGrainStore } from './grainStore';

export const useAppStore = defineStore('app', () => {
  const currentView = ref<AppView>(AppView.IDLE);
  /** 视图返回栈，用于 MANAGE / SETTINGS 等覆盖层的返回 */
  const viewStack = ref<AppView[]>([]);
  /** 当前抽中的课题 ID（抽签后设置，避免反推） */
  const drawnProjectId = ref<string | null>(null);

  function switchTo(view: AppView) {
    if (view === AppView.MANAGE || view === AppView.SETTINGS) {
      viewStack.value.push(currentView.value);
    }
    currentView.value = view;
  }

  /** 返回上一个视图（从栈中弹出） */
  function goBack() {
    if (viewStack.value.length > 0) {
      currentView.value = viewStack.value.pop()!;
    } else {
      currentView.value = AppView.IDLE;
    }
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

  return { currentView, viewStack, drawnProjectId, switchTo, goBack, init };
});

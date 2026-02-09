<template>
  <n-config-provider :theme="darkTheme">
    <n-global-style />
    <n-message-provider>
      <div class="app-root">
        <DrawView v-if="appStore.currentView === AppView.IDLE" />
        <DrawingView v-else-if="appStore.currentView === AppView.DRAWING" />
        <ResultView v-else-if="appStore.currentView === AppView.RESULT" />
        <PreWarmCardView v-else-if="appStore.currentView === AppView.PRE_WARM" />
        <ActiveView v-else-if="appStore.currentView === AppView.ACTIVE" />
        <EndSessionView v-else-if="appStore.currentView === AppView.END_SESSION" />
        <ProjectManageView v-else-if="appStore.currentView === AppView.MANAGE" />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { darkTheme } from 'naive-ui';
import { AppView } from './types';
import { useAppStore } from './stores/appStore';
import { useProjectStore } from './stores/projectStore';
import { useCardStore } from './stores/cardStore';
import DrawView from './views/DrawView.vue';
import DrawingView from './views/DrawingView.vue';
import ResultView from './views/ResultView.vue';
import PreWarmCardView from './views/PreWarmCardView.vue';
import ActiveView from './views/ActiveView.vue';
import EndSessionView from './views/EndSessionView.vue';
import ProjectManageView from './views/ProjectManageView.vue';

const appStore = useAppStore();
const projectStore = useProjectStore();
const cardStore = useCardStore();

onMounted(async () => {
  // 并行加载所有持久化数据
  await Promise.all([
    projectStore.loadAll(),
    cardStore.loadAll(),
  ]);
  // 初始化状态机（内部会加载 grain）
  await appStore.init();
});
</script>

<style scoped>
.app-root {
  width: 100vw;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>

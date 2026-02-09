<template>
  <div class="fullscreen-overlay" style="background: #1a1a2e">
    <div class="slot-container">
      <n-text :style="slotTextStyle">
        {{ displayName }}
      </n-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { AppView } from '../types';
import { useAppStore } from '../stores/appStore';
import { useProjectStore } from '../stores/projectStore';

const appStore = useAppStore();
const projectStore = useProjectStore();

const displayName = ref('');
const isRolling = ref(true);

const slotTextStyle = ref({
  fontSize: '56px',
  fontWeight: 'bold' as const,
  color: '#fff',
  textAlign: 'center' as const,
  transition: 'all 0.1s',
});

onMounted(async () => {
  const pool = projectStore.activeProjects;
  if (pool.length === 0) {
    appStore.switchTo(AppView.IDLE);
    return;
  }

  // 复制一份 pool 快照，避免响应式副作用
  const poolSnapshot = pool.map((p) => ({ name: p.name, color: p.color, id: p.id }));

  // 执行抽签
  const chosen = await projectStore.drawRandom();
  if (!chosen) {
    appStore.switchTo(AppView.IDLE);
    return;
  }

  // 保存抽中的课题 ID
  appStore.drawnProjectId = chosen.id;

  // 滚动动画：快速切换名称 1.5 秒
  let tick = 0;
  if (poolSnapshot.length === 1) {
    // 只有 1 个课题时直接显示，不需要滚动
    displayName.value = chosen.name;
    slotTextStyle.value = {
      ...slotTextStyle.value,
      color: chosen.color || '#e43636',
      fontSize: '72px',
    };
    setTimeout(() => {
      appStore.switchTo(AppView.RESULT);
    }, 800);
    return;
  }

  const interval = setInterval(() => {
    const idx = tick % poolSnapshot.length;
    displayName.value = poolSnapshot[idx].name;
    slotTextStyle.value = {
      ...slotTextStyle.value,
      color: poolSnapshot[idx].color || '#fff',
    };
    tick++;
  }, 80);

  setTimeout(() => {
    clearInterval(interval);
    isRolling.value = false;
    // 定格到选中的课题
    displayName.value = chosen.name;
    slotTextStyle.value = {
      ...slotTextStyle.value,
      color: chosen.color || '#e43636',
      fontSize: '72px',
    };

    // 稍作停顿后进入结果页
    setTimeout(() => {
      appStore.switchTo(AppView.RESULT);
    }, 400);
  }, 1500);
});
</script>

<style scoped>
.slot-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}
</style>

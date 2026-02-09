<template>
  <div class="fullscreen-overlay" :style="overlayStyle">
    <div class="result-enter" style="text-align: center; padding: 32px">
      <n-text :depth="3" style="font-size: 18px; letter-spacing: 4px; display: block; margin-bottom: 24px">
        命运已决
      </n-text>

      <n-text :style="titleStyle">
        未来 {{ selectedDays }} 天
      </n-text>

      <n-text :style="projectNameStyle">
        {{ drawnProject?.name ?? '—' }}
      </n-text>

      <!-- 时间粒选择 -->
      <div style="margin-top: 48px">
        <n-text :depth="3" style="font-size: 14px; display: block; margin-bottom: 12px">
          选择专注周期
        </n-text>
        <n-radio-group v-model:value="selectedDays" size="large">
          <n-radio-button :value="1">1 天</n-radio-button>
          <n-radio-button :value="2">2 天</n-radio-button>
          <n-radio-button :value="3">3 天</n-radio-button>
          <n-radio-button :value="4">4 天</n-radio-button>
        </n-radio-group>
      </div>

      <!-- 确认按钮 -->
      <n-button
        type="primary"
        size="large"
        strong
        :style="confirmBtnStyle"
        @click="handleConfirm"
      >
        我已准备好
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { AppView } from '../types';
import type { Project } from '../types';
import { useAppStore } from '../stores/appStore';
import { useProjectStore } from '../stores/projectStore';
import { useGrainStore } from '../stores/grainStore';
import { useCardStore } from '../stores/cardStore';

const appStore = useAppStore();
const projectStore = useProjectStore();
const grainStore = useGrainStore();
const cardStore = useCardStore();

const selectedDays = ref(1);

/** 获取抽中的课题（直接从 appStore 拿 ID） */
const drawnProject = computed<Project | undefined>(() => {
  const id = appStore.drawnProjectId;
  if (!id) return undefined;
  return projectStore.getProject(id);
});

const projectColor = computed(() => drawnProject.value?.color ?? '#e43636');

const overlayStyle = computed(() => ({
  background: `radial-gradient(ellipse at center, ${projectColor.value}22, #1a1a2e 70%)`,
}));

const titleStyle = computed(() => ({
  fontSize: '28px',
  color: '#aaa',
  display: 'block',
  marginBottom: '16px',
}));

const projectNameStyle = computed(() => ({
  fontSize: '72px',
  fontWeight: 'bold',
  color: projectColor.value,
  display: 'block',
  lineHeight: '1.2',
}));

const confirmBtnStyle = computed(() => ({
  marginTop: '48px',
  padding: '0 48px',
  height: '52px',
  fontSize: '18px',
}));

async function handleConfirm() {
  if (!drawnProject.value) return;

  // 锁定 grain
  await grainStore.confirm(drawnProject.value.id, selectedDays.value);

  // 检查是否有预热卡片
  const card = cardStore.getCardForProject(drawnProject.value.id);
  if (card) {
    appStore.switchTo(AppView.PRE_WARM);
  } else {
    appStore.switchTo(AppView.ACTIVE);
  }
}
</script>

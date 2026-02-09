<template>
  <div :style="containerStyle">
    <!-- 顶部状态栏 -->
    <div :style="headerStyle">
      <n-tag :color="{ color: projectColor + '22', textColor: projectColor, borderColor: projectColor + '44' }" size="small" round>
        {{ grainStore.remainingText }}
      </n-tag>
    </div>

    <!-- 课题名称 -->
    <n-text :style="{ fontSize: '48px', fontWeight: 'bold', color: projectColor, display: 'block', textAlign: 'center', marginTop: '60px' }">
      {{ project?.name ?? '—' }}
    </n-text>

    <!-- 进度描述 -->
    <n-text v-if="project?.progress" :depth="3" style="display: block; text-align: center; margin-top: 12px; font-size: 14px; max-width: 500px; margin-left: auto; margin-right: auto">
      {{ project.progress }}
    </n-text>

    <!-- 预热卡片 -->
    <div v-if="card" style="max-width: 520px; margin: 40px auto 0; width: 100%; padding: 0 24px">
      <n-card
        size="small"
        :bordered="true"
        style="background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.08)"
      >
        <div style="margin-bottom: 16px">
          <n-text :depth="3" style="font-size: 11px; display: block; margin-bottom: 2px">📌 下一步</n-text>
          <n-text style="font-size: 15px">{{ card.nextAction || '—' }}</n-text>
        </div>
        <div style="margin-bottom: 16px">
          <n-text :depth="3" style="font-size: 11px; display: block; margin-bottom: 2px">🎯 目标</n-text>
          <n-text style="font-size: 15px">{{ card.target || '—' }}</n-text>
        </div>
        <div>
          <n-text :depth="3" style="font-size: 11px; display: block; margin-bottom: 2px">📍 上次</n-text>
          <n-text style="font-size: 15px">{{ card.checkpoint || '—' }}</n-text>
        </div>
      </n-card>
    </div>

    <!-- 底部操作 -->
    <div style="position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%); display: flex; gap: 16px; align-items: center">
      <!-- 记录进度（不结束 grain） -->
      <n-button
        type="info"
        size="large"
        secondary
        @click="appStore.switchTo(AppView.END_SESSION)"
      >
        记录进度
      </n-button>

      <!-- 结束本轮并回到抽签 -->
      <n-popconfirm
        @positive-click="handleFinishRound"
        positive-text="确认结束"
        negative-text="取消"
      >
        <template #trigger>
          <n-button type="warning" size="large" secondary>
            结束本轮
          </n-button>
        </template>
        结束后将回到抽签页面，确定要结束当前课题吗？
      </n-popconfirm>
    </div>

    <!-- 管理入口 -->
    <div style="position: fixed; right: 24px; bottom: 24px; z-index: 10">
      <n-button quaternary circle size="large" @click="appStore.switchTo(AppView.MANAGE)">
        <template #icon>
          <n-icon :size="22">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58
                c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96
                c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84
                c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33
                c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58
                C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61
                l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54
                c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54
                c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32
                c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6
                s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </n-icon>
        </template>
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AppView } from '../types';
import { useAppStore } from '../stores/appStore';
import { useProjectStore } from '../stores/projectStore';
import { useGrainStore } from '../stores/grainStore';
import { useCardStore } from '../stores/cardStore';

const appStore = useAppStore();
const projectStore = useProjectStore();
const grainStore = useGrainStore();
const cardStore = useCardStore();

const project = computed(() => {
  if (!grainStore.grain) return undefined;
  return projectStore.getProject(grainStore.grain.projectId);
});

const projectColor = computed(() => project.value?.color ?? '#e43636');

const card = computed(() => {
  if (!grainStore.grain) return undefined;
  return cardStore.getCardForProject(grainStore.grain.projectId);
});

const containerStyle = computed(() => ({
  width: '100%',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  padding: '24px',
  position: 'relative' as const,
}));

const headerStyle = computed(() => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  padding: '8px 0',
}));

async function handleFinishRound() {
  await grainStore.clear();
  appStore.switchTo(AppView.IDLE);
}
</script>

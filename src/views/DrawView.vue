<template>
  <n-space vertical align="center" justify="center" :style="containerStyle">
    <!-- 无 active 课题时的提示 -->
    <template v-if="projectStore.activeProjects.length === 0">
      <n-icon :size="64" :color="'#555'">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </n-icon>
      <n-text :depth="3" style="font-size: 18px; margin-top: 12px">
        还没有课题，先添加几个吧
      </n-text>
      <n-button type="primary" size="large" @click="appStore.switchTo(AppView.MANAGE)" style="margin-top: 24px">
        管理课题
      </n-button>
    </template>

    <!-- 有课题 → 显示抽签按钮 -->
    <template v-else>
      <n-text :depth="3" style="font-size: 16px; margin-bottom: 32px; letter-spacing: 4px">
        今天学什么？
      </n-text>

      <n-button
        class="draw-btn-pulse"
        type="error"
        round
        :style="drawBtnStyle"
        @click="handleDraw"
      >
        抽 签
      </n-button>

      <n-text :depth="3" style="font-size: 14px; margin-top: 40px">
        {{ projectStore.activeProjects.length }} 个课题待抽取
      </n-text>
    </template>

    <!-- 管理入口：右下角 -->
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
  </n-space>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AppView } from '../types';
import { useAppStore } from '../stores/appStore';
import { useProjectStore } from '../stores/projectStore';

const appStore = useAppStore();
const projectStore = useProjectStore();

const containerStyle = computed(() => ({
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100vh',
  padding: '24px',
}));

const drawBtnStyle = computed(() => ({
  width: '200px',
  height: '200px',
  fontSize: '36px',
  fontWeight: 'bold',
  letterSpacing: '12px',
  borderRadius: '50%',
}));

function handleDraw() {
  appStore.switchTo(AppView.DRAWING);
}
</script>

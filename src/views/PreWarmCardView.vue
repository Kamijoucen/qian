<template>
  <div class="fullscreen-overlay" :style="overlayStyle">
    <div class="result-enter" style="text-align: center; padding: 32px; max-width: 600px; width: 100%">
      <n-text :depth="3" style="font-size: 16px; letter-spacing: 2px; display: block; margin-bottom: 32px">
        预热卡片
      </n-text>

      <n-text :style="{ fontSize: '36px', fontWeight: 'bold', color: projectColor, display: 'block', marginBottom: '40px' }">
        {{ project?.name ?? '—' }}
      </n-text>

      <n-card
        :bordered="true"
        style="text-align: left; background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1)"
      >
        <!-- 下一步行动 -->
        <div style="margin-bottom: 24px">
          <n-text :depth="3" style="font-size: 12px; display: block; margin-bottom: 4px">
            📌 下一步行动
          </n-text>
          <n-text style="font-size: 18px; line-height: 1.6">
            {{ card?.nextAction || '暂无' }}
          </n-text>
        </div>

        <!-- 今晚目标 -->
        <div style="margin-bottom: 24px">
          <n-text :depth="3" style="font-size: 12px; display: block; margin-bottom: 4px">
            🎯 最小目标
          </n-text>
          <n-text style="font-size: 18px; line-height: 1.6">
            {{ card?.target || '暂无' }}
          </n-text>
        </div>

        <!-- 上次停在哪 -->
        <div>
          <n-text :depth="3" style="font-size: 12px; display: block; margin-bottom: 4px">
            📍 上次停在
          </n-text>
          <n-text style="font-size: 18px; line-height: 1.6">
            {{ card?.checkpoint || '暂无' }}
          </n-text>
        </div>
      </n-card>

      <n-button
        type="primary"
        size="large"
        strong
        style="margin-top: 40px; padding: 0 48px; height: 52px; font-size: 18px"
        @click="appStore.switchTo(AppView.ACTIVE)"
      >
        开始执行
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

const overlayStyle = computed(() => ({
  background: `radial-gradient(ellipse at center, ${projectColor.value}22, #1a1a2e 70%)`,
}));
</script>

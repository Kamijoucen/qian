<template>
  <div style="width: 100%; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 24px 48px; overflow-y: auto">
    <n-text style="font-size: 24px; font-weight: bold; display: block; margin-bottom: 8px">
      记录进度
    </n-text>
    <n-text :depth="3" style="font-size: 14px; display: block; margin-bottom: 40px">
      更新当前进度，填写下次的预热卡片
    </n-text>

    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="top"
      style="max-width: 520px; width: 100%"
    >
      <!-- 更新进度 -->
      <n-form-item label="当前进度（看到哪了）" path="progress">
        <n-input
          v-model:value="formData.progress"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="如：读完了第3章 Replication"
        />
      </n-form-item>

      <n-divider style="margin: 16px 0">
        <n-text :depth="3" style="font-size: 12px">下次预热卡片</n-text>
      </n-divider>

      <!-- 下一步行动 -->
      <n-form-item label="下一步行动（越具体越好）" path="nextAction">
        <n-input
          v-model:value="formData.nextAction"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="如：打开 db_impl.cc 第342行"
        />
      </n-form-item>

      <!-- 今晚目标 -->
      <n-form-item label="最小目标" path="target">
        <n-input
          v-model:value="formData.target"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="如：看懂 WriteBatch 的 Merge 逻辑"
        />
      </n-form-item>

      <!-- 停在哪 -->
      <n-form-item label="停在哪里" path="checkpoint">
        <n-input
          v-model:value="formData.checkpoint"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="如：第3章第2节 Quorum 部分"
        />
      </n-form-item>

      <n-space justify="center" style="margin-top: 16px">
        <n-button quaternary size="large" @click="handleCancel">
          取消
        </n-button>
        <n-button type="primary" size="large" @click="handleSave">
          保存
        </n-button>
      </n-space>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { FormRules } from 'naive-ui';
import { AppView } from '../types';
import { useAppStore } from '../stores/appStore';
import { useProjectStore } from '../stores/projectStore';
import { useGrainStore } from '../stores/grainStore';
import { useCardStore } from '../stores/cardStore';

const appStore = useAppStore();
const projectStore = useProjectStore();
const grainStore = useGrainStore();
const cardStore = useCardStore();

const projectId = computed(() => grainStore.grain?.projectId ?? '');

const formData = ref({
  progress: '',
  nextAction: '',
  target: '',
  checkpoint: '',
});

const rules: FormRules = {
  progress: [],
  nextAction: [],
  target: [],
  checkpoint: [],
};

onMounted(() => {
  // 预填当前进度
  const project = projectStore.getProject(projectId.value);
  if (project) {
    formData.value.progress = project.progress;
  }
  // 预填上次卡片的 checkpoint
  const lastCard = cardStore.getCardForProject(projectId.value);
  if (lastCard) {
    formData.value.checkpoint = lastCard.checkpoint;
  }
});

function handleCancel() {
  appStore.switchTo(AppView.ACTIVE);
}

async function handleSave() {
  if (!projectId.value) return;

  // 更新课题进度
  await projectStore.updateProject(projectId.value, {
    progress: formData.value.progress,
  });

  // 保存预热卡片（只要有任意内容就保存）
  const hasContent = formData.value.nextAction || formData.value.target || formData.value.checkpoint;
  if (hasContent) {
    await cardStore.saveCard({
      projectId: projectId.value,
      nextAction: formData.value.nextAction,
      target: formData.value.target,
      checkpoint: formData.value.checkpoint,
    });
  }

  appStore.switchTo(AppView.ACTIVE);
}
</script>

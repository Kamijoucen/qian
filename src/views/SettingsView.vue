<template>
  <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px">
    <n-text style="font-size: 24px; font-weight: bold; display: block; margin-bottom: 8px">
      存储服务配置
    </n-text>
    <n-text :depth="3" style="font-size: 14px; display: block; margin-bottom: 40px">
      配置 Forma 存储服务的连接信息
    </n-text>

    <n-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-placement="top"
      style="max-width: 480px; width: 100%"
    >
      <n-form-item label="服务地址（Base URL）" path="baseUrl">
        <n-input
          v-model:value="formData.baseUrl"
          placeholder="http://localhost:8888/api"
        />
      </n-form-item>

      <n-form-item label="认证令牌（Token）" path="token">
        <n-input
          v-model:value="formData.token"
          type="password"
          show-password-on="click"
          placeholder="请输入 Token"
        />
      </n-form-item>

      <n-space justify="center" style="margin-top: 24px">
        <n-button
          v-if="canGoBack"
          quaternary
          size="large"
          @click="appStore.goBack()"
        >
          取消
        </n-button>
        <n-button
          type="info"
          size="large"
          secondary
          :loading="testing"
          @click="handleTest"
        >
          测试连接
        </n-button>
        <n-button
          type="primary"
          size="large"
          :loading="saving"
          @click="handleSave"
        >
          保存配置
        </n-button>
      </n-space>

      <n-alert
        v-if="testResult !== null"
        :type="testResult ? 'success' : 'error'"
        :title="testResult ? '连接成功' : '连接失败'"
        style="margin-top: 24px"
      >
        {{ testMessage }}
      </n-alert>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { FormRules } from 'naive-ui';
import { AppView } from '../types';
import { useAppStore } from '../stores/appStore';
import { useProjectStore } from '../stores/projectStore';
import { useCardStore } from '../stores/cardStore';

const appStore = useAppStore();
const projectStore = useProjectStore();
const cardStore = useCardStore();

const formRef = ref();
const saving = ref(false);
const testing = ref(false);
const testResult = ref<boolean | null>(null);
const testMessage = ref('');

const formData = ref({
  baseUrl: 'http://localhost:8888/api',
  token: '',
});

const rules: FormRules = {
  baseUrl: [
    { required: true, message: '请输入服务地址', trigger: 'blur' },
    {
      validator: (_rule, value: string) => {
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          return new Error('地址必须以 http:// 或 https:// 开头');
        }
        return true;
      },
      trigger: 'blur',
    },
  ],
  token: [{ required: true, message: '请输入认证令牌', trigger: 'blur' }],
};

/** 如果栈中有视图可返回，显示取消按钮 */
const canGoBack = computed(() => appStore.viewStack.length > 0);

onMounted(async () => {
  try {
    const config = await window.electronAPI.loadConfig();
    formData.value.baseUrl = config.baseUrl || 'http://localhost:8888/api';
    formData.value.token = config.token || '';
  } catch (e) {
    console.error('加载配置失败', e);
  }
});

async function handleSave() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  saving.value = true;
  try {
    await window.electronAPI.saveConfig({
      baseUrl: formData.value.baseUrl.replace(/\/+$/, ''),
      token: formData.value.token,
    });
    // 保存后尝试初始化 Schema 并进入主流程
    await window.electronAPI.ensureSchemas();

    // 加载所有业务数据（与 App.vue onMounted 保持一致）
    await Promise.all([
      projectStore.loadAll(),
      cardStore.loadAll(),
    ]);
    // 根据 grain 状态决定跳转到 IDLE 或 ACTIVE
    await appStore.init();
  } catch (e) {
    console.error('保存配置失败', e);
    testResult.value = false;
    testMessage.value = e instanceof Error ? e.message : '保存或连接失败';
  } finally {
    saving.value = false;
  }
}

async function handleTest() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  testing.value = true;
  testResult.value = null;
  try {
    // 先保存再测试
    await window.electronAPI.saveConfig({
      baseUrl: formData.value.baseUrl.replace(/\/+$/, ''),
      token: formData.value.token,
    });
    await window.electronAPI.ensureSchemas();
    testResult.value = true;
    testMessage.value = 'Schema 就绪，可以正常使用。';
  } catch (e) {
    testResult.value = false;
    testMessage.value = e instanceof Error ? e.message : '连接失败，请检查地址和令牌。';
  } finally {
    testing.value = false;
  }
}
</script>

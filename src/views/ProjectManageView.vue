<template>
  <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; padding: 24px; overflow-y: auto">
    <!-- 顶部导航 -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px">
      <n-button text size="large" @click="appStore.goBack()">
        ← 返回
      </n-button>
      <n-text style="font-size: 20px; font-weight: bold">课题管理</n-text>
      <n-space>
        <n-button size="small" secondary @click="handleExportReport">
          导出周报
        </n-button>
        <n-button type="primary" size="small" @click="openAddModal">
          + 添加课题
        </n-button>
      </n-space>
    </div>

    <!-- 课题列表 -->
    <n-list v-if="projectStore.projects.length > 0" bordered style="flex: 1; background: transparent">
      <n-list-item v-for="project in projectStore.projects" :key="project.id">
        <template #prefix>
          <div
            :style="{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: project.color,
              flexShrink: 0,
            }"
          />
        </template>
        <n-thing>
          <template #header>
            <n-text :style="{ opacity: project.status === 'archived' ? 0.4 : 1 }">
              {{ project.name }}
            </n-text>
            <n-tag
              v-if="project.status === 'archived'"
              size="tiny"
              :bordered="false"
              style="margin-left: 8px"
            >
              已归档
            </n-tag>
          </template>
          <template #description>
            <n-text :depth="3" style="font-size: 12px">
              {{ project.progress || '暂无进度记录' }}
            </n-text>
          </template>
        </n-thing>
        <template #suffix>
          <n-space>
            <n-button text size="small" @click="startEdit(project)">
              编辑
            </n-button>
            <n-button
              v-if="project.status === 'active'"
              text
              size="small"
              @click="handleArchive(project.id)"
            >
              归档
            </n-button>
            <n-button
              v-else
              text
              size="small"
              @click="handleRestore(project.id)"
            >
              恢复
            </n-button>
            <n-popconfirm @positive-click="handleDelete(project.id)">
              <template #trigger>
                <n-button text size="small" type="error">
                  删除
                </n-button>
              </template>
              确定要删除「{{ project.name }}」吗？此操作不可恢复。
            </n-popconfirm>
          </n-space>
        </template>
      </n-list-item>
    </n-list>

    <!-- 空状态 -->
    <div v-else style="flex: 1; display: flex; align-items: center; justify-content: center">
      <n-empty description="暂无课题，点击右上角添加" />
    </div>

    <!-- 添加/编辑课题弹窗 -->
    <n-modal
      v-model:show="showAddModal"
      preset="card"
      :title="isEditing ? '编辑课题' : '添加课题'"
      style="width: 420px"
      :mask-closable="false"
    >
      <n-form ref="modalFormRef" :model="modalForm" :rules="modalRules" label-placement="top">
        <n-form-item label="课题名称" path="name">
          <n-input v-model:value="modalForm.name" placeholder="如：LevelDB源码" />
        </n-form-item>

        <n-form-item label="主题色" path="color">
          <n-color-picker
            v-model:value="modalForm.color"
            :swatches="colorSwatches"
            :modes="['hex']"
          />
        </n-form-item>

        <n-form-item label="当前进度" path="progress">
          <n-input
            v-model:value="modalForm.progress"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="可选：记录当前看到哪里了"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="resetModal">取消</n-button>
          <n-button type="primary" @click="handleSubmit">
            {{ isEditing ? '保存' : '添加' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 导出结果提示 -->
    <n-modal v-model:show="showExportResult" preset="card" title="导出成功" style="width: 400px">
      <n-text>周报已导出到：</n-text>
      <n-text code style="display: block; margin-top: 8px; word-break: break-all">{{ exportPath }}</n-text>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FormRules } from 'naive-ui';
import type { Project } from '../types';
import { useAppStore } from '../stores/appStore';
import { useProjectStore } from '../stores/projectStore';

const appStore = useAppStore();
const projectStore = useProjectStore();

const showAddModal = ref(false);
const isEditing = ref(false);
const editingId = ref('');
const showExportResult = ref(false);
const exportPath = ref('');

const colorSwatches = [
  '#e43636', '#f57c00', '#ffb300', '#43a047',
  '#1e88e5', '#5e35b1', '#d81b60', '#00acc1',
];

const modalForm = ref({
  name: '',
  color: '#e43636',
  progress: '',
});

const modalRules: FormRules = {
  name: [{ required: true, message: '请输入课题名称', trigger: 'blur' }],
};

function startEdit(project: Project) {
  isEditing.value = true;
  editingId.value = project.id;
  modalForm.value = {
    name: project.name,
    color: project.color,
    progress: project.progress,
  };
  showAddModal.value = true;
}

function randomColor() {
  return colorSwatches[Math.floor(Math.random() * colorSwatches.length)];
}

function openAddModal() {
  isEditing.value = false;
  editingId.value = '';
  modalForm.value = { name: '', color: randomColor(), progress: '' };
  showAddModal.value = true;
}

function resetModal() {
  showAddModal.value = false;
  isEditing.value = false;
  editingId.value = '';
  modalForm.value = { name: '', color: randomColor(), progress: '' };
}

async function handleSubmit() {
  if (!modalForm.value.name.trim()) return;

  try {
    if (isEditing.value) {
      await projectStore.updateProject(editingId.value, {
        name: modalForm.value.name.trim(),
        color: modalForm.value.color,
        progress: modalForm.value.progress,
      });
    } else {
      await projectStore.addProject({
        name: modalForm.value.name.trim(),
        color: modalForm.value.color,
        progress: modalForm.value.progress,
      });
    }
  } catch (e) {
    console.error('保存课题失败', e);
  }
  resetModal();
}

async function handleArchive(id: string) {
  await projectStore.archiveProject(id);
}

async function handleRestore(id: string) {
  await projectStore.updateProject(id, { status: 'active' });
}

async function handleDelete(id: string) {
  await projectStore.deleteProject(id);
}

async function handleExportReport() {
  try {
    exportPath.value = await window.electronAPI.exportReport();
    showExportResult.value = true;
  } catch (e) {
    console.error('导出周报失败', e);
  }
}
</script>

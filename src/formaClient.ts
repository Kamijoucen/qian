/**
 * Forma HTTP 客户端 — 运行在主进程，封装所有 Forma API 调用。
 * 使用 Node.js 内置 fetch（Electron 40 基于 Node 20+）。
 */

import type { FormaConfig } from './types';

// ── 配置 ──────────────────────────────────────────────────
let _config: FormaConfig = { baseUrl: 'http://localhost:8888/api', token: '' };

export function setFormaConfig(config: FormaConfig) {
  _config = { ...config };
}

export function getFormaConfig(): FormaConfig {
  return { ..._config };
}

// ── 通用请求 ──────────────────────────────────────────────

interface FormaResponse<T = unknown> {
  code: string;
  message: string;
  data?: T;
}

async function request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const url = `${_config.baseUrl}${path}`;
  const headers: Record<string, string> = {
    Authorization: _config.token,
  };
  const init: RequestInit = { method, headers };

  if (method === 'POST' && body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);
  const json: FormaResponse<T> = await res.json();

  if (json.code !== '200' && json.code !== '0') {
    throw new Error(`Forma Error [${json.code}]: ${json.message}`);
  }
  return json.data as T;
}

// ── 日期格式转换 ──────────────────────────────────────────

/** ISO 8601 → Forma 格式 YYYY-MM-DD HH:mm:ss */
export function isoToForma(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Forma 格式 YYYY-MM-DD HH:mm:ss → ISO 8601 */
export function formaToIso(forma: string): string {
  // "2026-02-27 10:00:00" → "2026-02-27T10:00:00"
  return new Date(forma.replace(' ', 'T')).toISOString();
}

// ── Schema API ────────────────────────────────────────────

interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  maxLength?: number;
  minLength?: number;
  enumValues?: string[];
  description?: string;
}

interface SchemaDetail {
  appCode: string;
  name: string;
  description: string;
  fields: SchemaField[];
  createdAt: string;
  updatedAt: string;
}

export async function schemaDetail(appCode: string, name: string): Promise<SchemaDetail | null> {
  try {
    return await request<SchemaDetail>('GET', `/schema/detail?appCode=${appCode}&name=${name}`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('10002')) return null; // 资源不存在
    throw e;
  }
}

export async function schemaCreate(appCode: string, name: string, description: string, fields: SchemaField[]): Promise<void> {
  await request('POST', '/schema/create', { appCode, name, description, fields });
}

// ── Entity API ────────────────────────────────────────────

interface EntityField {
  name: string;
  value: string;
  type?: string;
}

interface EntityRecord {
  id: string;
  schemaName: string;
  fields: EntityField[];
  createdAt: string;
  updatedAt: string;
}

interface EntityListResult {
  total: number;
  list: EntityRecord[];
}

export async function entityCreate(appCode: string, schemaName: string, fields: EntityField[]): Promise<string> {
  const data = await request<{ id: string }>('POST', '/entity/create', { appCode, schemaName, fields });
  return data.id;
}

export async function entityUpdate(appCode: string, schemaName: string, id: string, fields: EntityField[]): Promise<void> {
  await request('POST', '/entity/update', { appCode, schemaName, id, fields });
}

export async function entityDelete(appCode: string, schemaName: string, id: string): Promise<void> {
  await request('POST', '/entity/delete', { appCode, schemaName, id });
}

export async function entityDetail(appCode: string, schemaName: string, id: string): Promise<EntityRecord> {
  return request<EntityRecord>('GET', `/entity/detail?appCode=${appCode}&schemaName=${schemaName}&id=${id}`);
}

export async function entityList(appCode: string, schemaName: string, page = 1, pageSize = 200): Promise<EntityListResult> {
  return request<EntityListResult>('GET', `/entity/list?appCode=${appCode}&schemaName=${schemaName}&page=${page}&pageSize=${pageSize}`);
}

// ── Schema 定义 ───────────────────────────────────────────

const APP_CODE = 'qian';

const PROJECT_SCHEMA: { name: string; description: string; fields: SchemaField[] } = {
  name: 'project',
  description: '学习课题',
  fields: [
    { name: 'name', type: 'string', required: true, maxLength: 100, minLength: 1, description: '课题名称' },
    { name: 'color', type: 'string', required: true, maxLength: 20, description: '主题色（十六进制）' },
    { name: 'status', type: 'enum', required: true, enumValues: ['active', 'archived'], description: '课题状态' },
    { name: 'progress', type: 'text', required: false, maxLength: 2000, description: '当前进度描述' },
    { name: 'drawHistory', type: 'array', required: false, description: '抽取历史（ISO 时间戳数组）' },
  ],
};

const CARD_SCHEMA: { name: string; description: string; fields: SchemaField[] } = {
  name: 'pre_warm_card',
  description: '预热卡片',
  fields: [
    { name: 'projectId', type: 'string', required: true, maxLength: 50, description: '关联课题 ID' },
    { name: 'nextAction', type: 'text', required: false, maxLength: 2000, description: '下一步行动' },
    { name: 'target', type: 'text', required: false, maxLength: 2000, description: '今晚最小目标' },
    { name: 'checkpoint', type: 'text', required: false, maxLength: 2000, description: '上次停在哪里' },
  ],
};

const GRAIN_SCHEMA: { name: string; description: string; fields: SchemaField[] } = {
  name: 'grain',
  description: '时间粒（专注周期，单例）',
  fields: [
    { name: 'projectId', type: 'string', required: true, maxLength: 50, description: '锁定的课题 ID' },
    { name: 'startTime', type: 'date', required: true, description: '开始时间' },
    { name: 'durationDays', type: 'number', required: true, description: '持续天数 1-4' },
    { name: 'confirmed', type: 'boolean', required: true, description: '是否已确认' },
  ],
};

/** 确保所有 Schema 已就绪，不存在则创建 */
export async function ensureSchemas(): Promise<void> {
  for (const schema of [PROJECT_SCHEMA, CARD_SCHEMA, GRAIN_SCHEMA]) {
    const existing = await schemaDetail(APP_CODE, schema.name);
    if (!existing) {
      await schemaCreate(APP_CODE, schema.name, schema.description, schema.fields);
    }
  }
}

// ── 业务层：Project ───────────────────────────────────────

import type { Project, PreWarmCard, Grain } from './types';

/** Entity fields → Project */
function entityToProject(entity: EntityRecord): Project {
  const fieldMap = new Map(entity.fields.map((f) => [f.name, f.value]));
  return {
    id: entity.id,
    name: fieldMap.get('name') ?? '',
    color: fieldMap.get('color') ?? '#e43636',
    status: (fieldMap.get('status') as Project['status']) ?? 'active',
    progress: fieldMap.get('progress') ?? '',
    drawHistory: parseJsonArray(fieldMap.get('drawHistory') ?? '[]'),
    createdAt: entity.createdAt ? formaToIso(entity.createdAt) : new Date().toISOString(),
    updatedAt: entity.updatedAt ? formaToIso(entity.updatedAt) : new Date().toISOString(),
  };
}

/** Project → Entity fields（全量，used for create & update） */
function projectToFields(p: { name: string; color: string; status: string; progress: string; drawHistory: string[] }): EntityField[] {
  return [
    { name: 'name', value: p.name },
    { name: 'color', value: p.color },
    { name: 'status', value: p.status },
    { name: 'progress', value: p.progress },
    { name: 'drawHistory', value: JSON.stringify(p.drawHistory) },
  ];
}

function parseJsonArray(val: string): string[] {
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function loadProjects(): Promise<Project[]> {
  const result = await entityList(APP_CODE, 'project', 1, 500);
  return result.list.map(entityToProject);
}

export async function createProject(data: { name: string; color: string; progress?: string }): Promise<Project> {
  const fields = projectToFields({
    name: data.name,
    color: data.color,
    status: 'active',
    progress: data.progress ?? '',
    drawHistory: [],
  });
  const id = await entityCreate(APP_CODE, 'project', fields);
  // 查询返回完整记录
  const entity = await entityDetail(APP_CODE, 'project', id);
  return entityToProject(entity);
}

export async function updateProject(id: string, currentProject: Project, changes: Partial<Pick<Project, 'name' | 'color' | 'progress' | 'status' | 'drawHistory'>>): Promise<void> {
  const merged = {
    name: changes.name ?? currentProject.name,
    color: changes.color ?? currentProject.color,
    status: changes.status ?? currentProject.status,
    progress: changes.progress ?? currentProject.progress,
    drawHistory: changes.drawHistory ?? currentProject.drawHistory,
  };
  await entityUpdate(APP_CODE, 'project', id, projectToFields(merged));
}

export async function deleteProject(id: string): Promise<void> {
  await entityDelete(APP_CODE, 'project', id);
}

// ── 业务层：PreWarmCard ───────────────────────────────────

function entityToCard(entity: EntityRecord): PreWarmCard {
  const fieldMap = new Map(entity.fields.map((f) => [f.name, f.value]));
  return {
    id: entity.id,
    projectId: fieldMap.get('projectId') ?? '',
    nextAction: fieldMap.get('nextAction') ?? '',
    target: fieldMap.get('target') ?? '',
    checkpoint: fieldMap.get('checkpoint') ?? '',
    createdAt: entity.createdAt ? formaToIso(entity.createdAt) : new Date().toISOString(),
  };
}

export async function loadCards(): Promise<PreWarmCard[]> {
  const result = await entityList(APP_CODE, 'pre_warm_card', 1, 500);
  return result.list.map(entityToCard);
}

export async function createCard(data: { projectId: string; nextAction: string; target: string; checkpoint: string }): Promise<PreWarmCard> {
  const fields: EntityField[] = [
    { name: 'projectId', value: data.projectId },
    { name: 'nextAction', value: data.nextAction },
    { name: 'target', value: data.target },
    { name: 'checkpoint', value: data.checkpoint },
  ];
  const id = await entityCreate(APP_CODE, 'pre_warm_card', fields);
  const entity = await entityDetail(APP_CODE, 'pre_warm_card', id);
  return entityToCard(entity);
}

// ── 业务层：Grain（单例模式） ─────────────────────────────

function entityToGrain(entity: EntityRecord): Grain {
  const fieldMap = new Map(entity.fields.map((f) => [f.name, f.value]));
  return {
    entityId: entity.id,
    projectId: fieldMap.get('projectId') ?? '',
    startTime: fieldMap.get('startTime') ? formaToIso(fieldMap.get('startTime')!) : new Date().toISOString(),
    durationDays: Number(fieldMap.get('durationDays') ?? '1'),
    confirmed: fieldMap.get('confirmed') === 'true',
  };
}

function grainToFields(g: Omit<Grain, 'entityId'>): EntityField[] {
  return [
    { name: 'projectId', value: g.projectId },
    { name: 'startTime', value: isoToForma(g.startTime) },
    { name: 'durationDays', value: String(g.durationDays) },
    { name: 'confirmed', value: String(g.confirmed) },
  ];
}

/** 加载 Grain（单例：取列表中第一条） */
export async function loadGrain(): Promise<Grain | null> {
  const result = await entityList(APP_CODE, 'grain', 1, 1);
  if (result.list.length === 0) return null;
  return entityToGrain(result.list[0]);
}

/** 保存 Grain：已有 → 更新，否则 → 创建 */
export async function saveGrain(grain: Omit<Grain, 'entityId'>): Promise<Grain> {
  const existing = await loadGrain();
  const fields = grainToFields(grain);

  if (existing?.entityId) {
    await entityUpdate(APP_CODE, 'grain', existing.entityId, fields);
    return { ...grain, entityId: existing.entityId };
  } else {
    const id = await entityCreate(APP_CODE, 'grain', fields);
    return { ...grain, entityId: id };
  }
}

/** 清除 Grain：删除所有 Grain Entity */
export async function clearGrain(): Promise<void> {
  const result = await entityList(APP_CODE, 'grain', 1, 10);
  for (const entity of result.list) {
    await entityDelete(APP_CODE, 'grain', entity.id);
  }
}

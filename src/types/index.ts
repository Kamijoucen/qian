/** 应用视图状态枚举 */
export enum AppView {
  /** 空闲 — 显示抽签按钮 */
  IDLE = 'IDLE',
  /** 抽签动画中 */
  DRAWING = 'DRAWING',
  /** 全屏展示结果 */
  RESULT = 'RESULT',
  /** 预热卡片全屏 */
  PRE_WARM = 'PRE_WARM',
  /** 当前课题工作页 */
  ACTIVE = 'ACTIVE',
  /** 结束学习 / 填写下次卡片 */
  END_SESSION = 'END_SESSION',
  /** 课题管理 */
  MANAGE = 'MANAGE',
}

/** 课题状态 */
export type ProjectStatus = 'active' | 'archived';

/** 学习课题 */
export interface Project {
  id: string;
  /** 课题名称，如 "LevelDB源码" */
  name: string;
  /** 主题色（十六进制） */
  color: string;
  /** 状态 */
  status: ProjectStatus;
  /** 当前进度描述（上次看到哪 / 卡在哪） */
  progress: string;
  /** 历史抽取记录（ISO 时间戳数组） */
  drawHistory: string[];
  createdAt: string;
  updatedAt: string;
}

/** 预热卡片 */
export interface PreWarmCard {
  id: string;
  /** 所属课题 ID */
  projectId: string;
  /** 极具体的下一步行动 */
  nextAction: string;
  /** 今晚最小目标 */
  target: string;
  /** 上次停在哪里 */
  checkpoint: string;
  createdAt: string;
}

/** 时间粒（专注周期） */
export interface Grain {
  /** 锁定的课题 ID */
  projectId: string;
  /** 开始时间（ISO） */
  startTime: string;
  /** 持续天数：1-4 */
  durationDays: number;
  /** 用户是否已确认（点击"我已准备好"） */
  confirmed: boolean;
}

/** 主进程暴露给渲染进程的 IPC API */
export interface ElectronAPI {
  loadProjects: () => Promise<Project[]>;
  saveProjects: (projects: Project[]) => Promise<void>;
  loadCards: () => Promise<PreWarmCard[]>;
  saveCards: (cards: PreWarmCard[]) => Promise<void>;
  loadGrain: () => Promise<Grain | null>;
  saveGrain: (grain: Grain | null) => Promise<void>;
  exportReport: () => Promise<string>;
}

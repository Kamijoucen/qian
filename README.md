# Qian（签）

随机抽签决定今天学什么，避免选择困难。抽到后锁定 1-4 天，专注一个课题。

## 功能

- 管理学习课题（名称、主题色、进度）
- 随机抽签选课题，抽完锁定不可换
- 预热卡片：记录下一步行动、最小目标、上次停在哪
- 时间粒锁定：1-4 天内只做这一件事
- 数据存储在 Forma 服务端

## 流程

1. 首次启动，配置 Forma 服务地址和令牌
2. 添加课题 → 抽签 → 选专注天数 → 开始学习
3. 学习结束，记录进度，填下次预热卡片
4. 下次打开，直接展示当前课题，无需重新抽签

## 技术栈

- **Electron 40** + **Vue 3** + **TypeScript 5**
- **Naive UI 2** 组件库
- **Pinia** 状态管理
- **Forma** 远程存储服务（App code: `qian`）
- **electron-builder** + **NSIS** 打包
- **Vite 5** + **vite-plugin-electron** 构建

## 存储架构

数据通过 Forma HTTP API 存储在远程服务端，本地仅保留连接配置文件：

```
~/qian-data/
  forma-config.json      # Forma 服务地址与认证令牌
```

Forma 中的数据结构（App code: `qian`）：

| Schema | 说明 | 关键字段 |
|--------|------|----------|
| `project` | 学习课题 | name, color, status, progress, drawHistory |
| `pre_warm_card` | 预热卡片 | projectId, nextAction, target, checkpoint |
| `grain` | 时间粒（单例） | projectId, startTime, durationDays, confirmed |

## 开发

```bash
npm install        # 安装依赖
npm run dev        # 开发模式启动（支持热更新）
npm run build      # 仅构建（不打包安装程序）
npm run lint       # ESLint 检查
```

## 打包安装程序

使用 electron-builder + NSIS 生成各平台安装包，产物输出到 `release/` 目录。

> **注意**：只能在对应操作系统上打对应平台的包。跨平台打包需借助 CI（如 GitHub Actions）。

| 目标平台 | 命令 | 产物格式 |
|---|---|---|
| Windows | `npm run dist:win` | `.exe`（NSIS 安装包） |
| macOS | `npm run dist:mac` | `.dmg` + `.zip` |
| Linux | `npm run dist:linux` | `.AppImage` + `.deb` |
| 当前平台 | `npm run dist` | 自动检测 |

## License

MIT

# Qian（签）

**学习上下文管理器** — 解决"坐到电脑前不知道学什么"的决策瘫痪问题。

将多线程并行学习强制转为**单线程串行执行**，通过随机抽签 + 时间锁定消除决策疲劳。

## 核心功能

- **课题池管理** — 增删改查学习课题，每个课题带名称、主题色、进度描述
- **抽签引擎** — 一键随机抽取课题，动画展示结果，抽完不可反悔
- **预热卡片** — 每个课题绑定"下一步行动 / 最小目标 / 上次停在哪"，抽签后自动弹出，消除启动摩擦
- **时间粒锁定** — 选择 1-4 天专注周期，周期内锁定当前课题，屏蔽切换冲动
- **本地存储** — 数据存在 `~/qian-data/`，JSON 文件，零配置，无需后端
- **Markdown 周报导出** — 一键导出最近 7 天的学习记录

## 使用流程

1. 打开应用 → 看到抽签按钮（或上次未完成的课题）
2. 点击抽签 → 随机选出课题 → 选择专注天数 → 确认
3. 弹出预热卡片 → 点击"开始执行" → 进入学习
4. 学习结束 → 记录进度 + 填写下次预热卡片
5. 下次打开 → 直接展示当前课题和预热卡片，无需重新抽签

## 技术栈

- **Electron 40** + **Vue 3** + **TypeScript 5**
- **Naive UI 2** 组件库
- **Pinia** 状态管理
- **Electron Forge** → **electron-builder** + **NSIS** 打包
- **Vite 5** + **vite-plugin-electron** 构建

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
| Windows | `npm run dist:win` | `.exe`（NSIS 安装包，支持自定义安装路径） |
| macOS | `npm run dist:mac` | `.dmg` + `.zip` |
| Linux | `npm run dist:linux` | `.AppImage` + `.deb` |
| 当前平台 | `npm run dist` | 自动检测 |

### Windows 安装包特性

- 中文安装界面
- 支持自定义安装路径
- 自动创建桌面快捷方式和开始菜单

### 自定义应用图标

将图标文件放到 `build/icon.ico`（Windows）/ `build/icon.icns`（macOS）/ `build/icon.png`（Linux），然后在 `package.json` 的 `build.win` 中添加 `"icon": "build/icon.ico"` 即可。

## 数据目录

运行后自动创建 `~/qian-data/`：

```
~/qian-data/
  projects.json          # 课题列表
  cards.json             # 预热卡片
  grain.json             # 当前时间粒锁定状态
  weekly-report-*.md     # 导出的周报
```

## License

MIT

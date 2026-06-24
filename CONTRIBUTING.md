# 参与贡献

感谢你对 `@uni-helper/axios-adapter` 的关注！本文档将帮助你快速了解项目结构、本地开发流程、测试方式和提交规范。

## 前置条件

- Node.js >= 18
- pnpm >= 10.34.4（项目已通过 `packageManager` 字段固定版本）
- Git（用于克隆与版本管理）

## 仓库结构

```
axios-adapter/
├── src/                   # 适配器核心代码
│   ├── index.ts           # createUniAppAxiosAdapter 入口，挂载 upload/download
│   ├── globalExtensions.ts# Axios 类型扩展，补充 uni-app 请求参数与 upload/download 方法
│   ├── types.ts           # 公共类型定义（UserOptions、MethodType 等）
│   ├── utils.ts           # 请求序列化、进度事件处理等工具函数
│   ├── unplugin.ts        # 构建插件，为小程序环境注入 FormData/Blob polyfill
│   ├── vite.ts            # Vite 插件导出
│   ├── webpack.ts         # Webpack 插件导出
│   └── methods/           # request/upload/download 的具体实现
├── test/                  # 自动化测试
│   ├── setup.ts           # Vitest 全局 setup，配置 MSW 与 uni.* mock
│   ├── adapter.test.ts    # 适配器主流程测试
│   └── utils.test.ts      # 工具函数测试
├── playground/            # uni-app 演示工程，便于本地调试
├── dist/                  # 构建产物（发布到 npm 的内容）
└── package.json
```

## 本地开发

```bash
# 1. 安装依赖（同时安装 playground 依赖）
pnpm install

# 2. 构建适配器（生成 dist/）
pnpm run build

# 3. 监听模式开发（修改 src/ 后自动重新构建）
pnpm run dev

# 4. 启动 playground（默认 H5 模式）
pnpm run play
```

`pnpm run play` 会进入 `playground/` 并执行 `npm run dev:h5`。若首次运行，确保 playground 的依赖已安装（`pnpm install` 已一并处理）。

## 测试与检查

```bash
# 运行全部测试
pnpm run test            # 底层使用 vitest

# 只运行某个测试文件
pnpm run test -- test/adapter.test.ts

# 类型检查
pnpm run typecheck       # tsc --noEmit

# 代码规范检查
pnpm run lint

# 自动修复可修复的 lint 问题
pnpm run lint:fix
```

### 测试说明

- 测试框架：[Vitest](https://vitest.dev/)
- 网络模拟：[MSW](https://mswjs.io/)
- uni-app 环境模拟：在 `test/setup.ts` 中通过 `vi.stubGlobal('uni', ...)` 模拟 `uni.request`、`uni.downloadFile`、`uni.uploadFile`，保证测试可在纯 Node.js 环境运行。

## 代码架构

1. **适配器入口 (`src/index.ts`)**
   - `createUniAppAxiosAdapter` 接收 `UserOptions`，返回标准 `AxiosAdapter`。
   - 在 Axios 原型上挂载 `upload`、`download` 方法，使其对所有实例可用。
2. **请求执行 (`src/methods/`)**
   - `request.ts`：处理普通 HTTP 请求，调用 `uni.request`。
   - `download.ts`：调用 `uni.downloadFile`，并将结果转换为 axios 响应结构。
   - `upload.ts`：调用 `uni.uploadFile`，自动处理 `FormData` 与进度事件。
3. **工具函数 (`src/utils.ts`)**
   - 解析请求头、序列化参数、计算上传/下载进度。
4. **类型扩展 (`src/globalExtensions.ts`)**
   - 扩展 `AxiosRequestConfig`，支持 uni-app 的 `enableCache`、`enableHttp2` 等配置。
   - 扩展 `Axios` 类型，补充 `upload`、`download` 方法签名。
5. **构建插件 (`src/unplugin.ts`)**
   - 使用 [unplugin](https://unplugin.unjs.io/) 提供 Vite/Webpack 插件。
   - 在小程序环境下自动注入 `miniprogram-formdata`、`miniprogram-blob` polyfill。

## 提交规范

1. Fork 本仓库并克隆到本地。
2. 基于 `main` 创建功能分支：`feat/xxx`、`fix/xxx`、`docs/xxx` 等。
3. 保持提交信息清晰，可采用 [Conventional Commits](https://www.conventionalcommits.org/) 格式（如 `feat: 支持自定义超时`）。
4. 提交前执行：
   ```bash
   pnpm run lint
   pnpm run test
   pnpm run typecheck
   ```
5. 推送到远端后发起 Pull Request，描述改动内容、测试结果与关联 Issue。

## Pull Request 指南

- 保持 PR 范围聚焦，一次只解决一个问题或新增一个特性。
- 若涉及 API 变化，请同步更新 `README.md` 与类型定义。
- 确保 CI 通过（lint、test、typecheck）。
- 如需讨论方案，可在 Issue 中先行沟通。

## 行为准则

请阅读并遵守项目所在组织的 [Code of Conduct](../.github/CODE_OF_CONDUCT.md)。

感谢你的贡献！如有疑问，欢迎在 [GitHub Issues](https://github.com/uni-helper/axios-adapter/issues) 中提问。

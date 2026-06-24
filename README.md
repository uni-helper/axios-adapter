<img src="./assets/logo.svg" alt="logo of @uni-helper/axios-adapter repository" width="100" height="100" align="right" />

# @uni-helper/axios-adapter

> 适用于 Vue2 和 Vue3 的 uniapp Axios 适配器

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/uni-helper/axios-adapter)

## 目录

- [简介](#简介)
- [平台兼容性](#平台兼容性)
- [安装](#安装)
- [快速开始](#快速开始)
- [使用](#使用)
  - [创建自定义实例](#创建自定义实例)
  - [与 useAxios 一起使用](#与-useaxios-一起使用)
  - [上传和下载](#上传和下载)
  - [小程序](#小程序)
- [API 参考](#api-参考)
- [版本策略](#版本策略)
- [参与贡献](#参与贡献)
- [许可证](#许可证)

## 简介

`@uni-helper/axios-adapter` 封装了 uni-app 的 `uni.request`、`uni.downloadFile`、`uni.uploadFile` 等接口，让开发者可以在 uni-app 的各类平台上继续使用熟悉的 axios 编程范式。适配器同时为 TypeScript 项目提供全局类型扩展，补充 `upload`、`download` 以及 uni-app 专有请求参数的类型定义。

## 平台兼容性

| Vue 版本 | 支持情况 |
| -------- | -------- |
| Vue 2    | √        |
| Vue 3    | √        |

| App                                      | 快应用 | 微信小程序 | 支付宝小程序 | 百度小程序 | 字节小程序 | QQ 小程序 |
| ---------------------------------------- | ------ | ---------- | ------------ | ---------- | ---------- | --------- |
| HBuilderX 3.4.8<br/>app-vue<br/>app-nvue | √      | √          | √            | √          | √          | √         |

| 钉钉小程序 | 快手小程序 | 飞书小程序 | 京东小程序 |
| ---------- | ---------- | ---------- | ---------- |
| √          | √          | √          | √          |

| H5-Safari | Android Browser | 微信浏览器(Android) | QQ 浏览器(Android) | Chrome | IE  | Edge | Firefox | PC-Safari |
| --------- | --------------- | ------------------- | ------------------ | ------ | --- | ---- | ------- | --------- |
| √         | √               | √                   | √                  | √      | √   | √    | √       | √         |

## 安装

```bash
pnpm i @uni-helper/axios-adapter axios
```

适配器与 axios 的版本需要保持主版本号和次版本号一致。当前适配器版本为 `1.18.0`，推荐搭配 `axios@^1.18.0` 使用。

## 快速开始

```ts
import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter'
import axios from 'axios'

axios.defaults.adapter = createUniAppAxiosAdapter()
```

配置完成后，即可像往常一样使用 `axios.get`、`axios.post` 等方法发起请求。

## 使用

### 创建自定义实例

```ts
import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter'
import axios from 'axios'

const instance = axios.create({ adapter: createUniAppAxiosAdapter() })
```

### 与 [useAxios](https://vueuse.org/integrations/useAxios/) 一起使用

```ts
import { createUniAppAxiosAdapter } from '@uni-helper/axios-adapter'
import axios from 'axios'

axios.defaults.adapter = createUniAppAxiosAdapter()
const { data, isFinished } = useAxios('/posts')
```

### 上传和下载

```ts
// 下载
axios.download('/')
// or
axios.request({
  url: '/',
  method: 'download',
})

// 上传
axios.upload('/', new File([new Blob()], 'fake file'))
// or
axios.request({
  url: '/',
  method: 'upload',
  data: new File([new Blob()], 'fake file'),
})
```

### 小程序

自 axios 1.4.0 开始，axios 已对小程序环境做了兼容处理。若仍需在小程序中使用 `FormData` 和 `Blob`，可安装对应的 polyfill 并启用构建插件：

```bash
pnpm add miniprogram-formdata miniprogram-blob
```

```ts
// vite.config.js
import uniAxiosAdapter from '@uni-helper/axios-adapter/vite'

export default {
  plugins: [
    uniAxiosAdapter()
  ]
}
```

如果你使用的是 Vue CLI，改用 `@uni-helper/axios-adapter/webpack` 即可。

## API 参考

### `createUniAppAxiosAdapter(options?: UserOptions): AxiosAdapter`

创建适配器实例，可直接赋值给 `axios.defaults.adapter` 或 `axios.create({ adapter })`。

- `options`：可选配置对象，当前版本支持扩展 uni-app 请求参数（参见 `globalExtensions.ts` 中的类型定义）。
- 返回值：标准的 `AxiosAdapter` 函数。

### `axios.upload<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>`

以 `uni.uploadFile` 发送上传请求，`data` 通常为 `FormData` 实例。

### `axios.download<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>`

以 `uni.downloadFile` 发起下载请求，返回的 `response.data` 默认为文件临时路径或 `Buffer`（取决于运行环境）。

## 版本策略

自 1.4.0 开始，请始终保持主版本号和次版本号与 axios 一致。例如当你安装了 1.5.1 版本时，你可以安装 axios 的 1.5.x 版本。这样做的目的是确保适配器始终支持最新的 axios 特性。

## 参与贡献

欢迎通过 Issue 或 Pull Request 参与改进本项目。开始前请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)，了解本地开发、测试、提交规范与架构说明。

## 许可证

[MIT](https://github.com/uni-helper/axios-adapter/blob/main/LICENSE)

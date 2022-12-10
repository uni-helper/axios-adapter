# @uni-helper/axios-adapter

**WIP** 这是一个用于 uni-app 的 Axios 适配器

[English](./README.md) | 简体中文

## 安装

```
pnpm i @uni-helper/axios-adapter axios
```

## 使用

```ts
import axios from "axios";
import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";

const $axios = axios.create({
  adapter: createUniAppAxiosAdapter(),
});
```

## 客户端类型

```ts
/// <reference types="@uni-helper/axios-adapter/client" />
```

## 配置

见 [types.ts](./src/types.ts)


## 注意事项

`axios-adapter` 使用了 `axios` 内置的工具库函数，但是 axios 未导出 `"./lib/*": "./lib/*"`，因此您需要使用类似 `pnpm patch` 的工具导出。

这里有一个例子: [axios@1.2.1.patch](./patches/axios%401.2.1.patch)

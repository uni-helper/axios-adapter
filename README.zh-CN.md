# @uni-helper/axios-adapter

这是一个用于 uni-app 的 Axios 适配器

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

# axios-plugin-uniapp

此插件是用于 uniapp 的 Axios 适配器

[English](./README.md) | 简体中文

## 安装

```
pnpm i axios-plugin-uniapp
```

## 使用

```ts
import axios from "axios";
import { uniappAdapter } from "axios-plugin-uniapp";

const $axios = axios.create({
  adapter: uniappAdapter,
});
```

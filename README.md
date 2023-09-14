<img src="./assets/logo.svg" alt="logo of @uni-helper/axios-adapter repository" width="100" height="100" align="right" />

# @uni-helper/axios-adapter

> 适用于 Vue2 和 Vue3 的 uniapp Axios 适配器

## 安装

```
pnpm i @uni-helper/axios-adapter axios
```

## 使用

### 基本用法

```ts
import axios from "axios";
import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";

const instance = axios.create({
  adapter: createUniAppAxiosAdapter(),
});
```

### 与 useAxios 一起使用

```ts
import axios from "axios";
import { useAxios } from "@vueuse/integrations/useAxios";
import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";

const instance = axios.create({
  adapter: createUniAppAxiosAdapter(),
});

const { data, isFinished } = useAxios("/posts", instance);
```

### 上传和下载

```ts
import axios from "axios";
import { createUniAppAxiosAdapter } from "@uni-helper/axios-adapter";

const instance = axios.create({
  adapter: createUniAppAxiosAdapter(),
});

// 一个假文件
const data = new File([new Blob()], "emptyFile");

// 下载
instance.download("/");
// or
instance.request({
  url: "/",
  method: "download",
});

// 上传
instance.upload("/", data);
// or
instance.request({
  url: "/",
  method: "upload",
  data,
});
```

### 小程序

axios 依赖了 `FormData` 和 `Blob` 对象, 而小程序没有，使用提供的插件来解决这一问题

```ts
// vite.config.js
import uniAxiosAdapter from "@uni-helper/axios-adapter/vite";

export default {
  plugins: [
  ...
  uniAxiosAdapter()
  ...
  ],
}
```
> [!WARNING]
> 这个插件通过将 `FormData` 和 `Blob` 导出为空 `class`来解决兼容性问题，如果你确实需要的话，使用 `pnpm add miniprogram-formdata miniprogram-blob` 来安装对应的 polyfill 即可，插件会自动使用。

如果你使用的是 Vue CLI，改用 `@uni-helper/axios-adapter/webpack` 即可

## 客户端类型

提供了 upload 和 download 方法的类型提示，及 AxiosRequestConfig 支持传递 uniapp 特有参数

```ts
/// <reference types="@uni-helper/axios-adapter/client" />
```

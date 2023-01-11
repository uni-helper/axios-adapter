# @uni-helper/axios-adapter

这是一个用于 uni-app 的 Axios 适配器

> 同时支持 Vue2 和 Vue3

[English](./README.md) | 简体中文

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

## 客户端类型

提供了 upload 和 download 方法的类型提示，及 AxiosRequestConfig 支持传递 uniapp 特有参数

```ts
/// <reference types="@uni-helper/axios-adapter/client" />
```
